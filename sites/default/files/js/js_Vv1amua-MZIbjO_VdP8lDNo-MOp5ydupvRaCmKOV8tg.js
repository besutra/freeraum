/**
 * @file
 * CKEditor button and group configuration user interface.
 */
(function ($, Drupal, _, CKEDITOR) {

  "use strict";

  Drupal.ckeditor = Drupal.ckeditor || {};

  Drupal.behaviors.ckeditorAdmin = {
    attach: function (context) {
      // Process the CKEditor configuration fragment once.
      var $configurationForm = $(context).find('.ckeditor-toolbar-configuration');
      if ($configurationForm.once('ckeditor-configuration').length) {
        var $textarea = $configurationForm
          // Hide the textarea that contains the serialized representation of the
          // CKEditor configuration.
          .find('.form-item-editor-settings-toolbar-button-groups')
          .hide()
          // Return the textarea child node from this expression.
          .find('textarea');

        // The HTML for the CKEditor configuration is assembled on the server and
        // and sent to the client as a serialized DOM fragment.
        $configurationForm.append(drupalSettings.ckeditor.toolbarAdmin);

        // Create a configuration model.
        var model = Drupal.ckeditor.models.configurationModel = new Drupal.ckeditor.ConfigurationModel({
          $textarea: $textarea,
          activeEditorConfig: JSON.parse($textarea.val()),
          hiddenEditorConfig: drupalSettings.ckeditor.hiddenCKEditorConfig
        });

        // Create the configuration Views.
        var viewDefaults = {
          model: model,
          el: $('.ckeditor-toolbar-configuration')
        };
        Drupal.ckeditor.views = {
          controller: new Drupal.ckeditor.ConfigurationController(viewDefaults),
          visualView: new Drupal.ckeditor.ConfigurationVisualView(viewDefaults),
          keyboardView: new Drupal.ckeditor.ConfigurationKeyboardView(viewDefaults),
          auralView: new Drupal.ckeditor.ConfigurationAuralView(viewDefaults)
        };
      }
    },
    detach: function (context, settings, trigger) {
      // Early-return if the trigger for detachment is something else than unload.
      if (trigger !== 'unload') {
        return;
      }

      // We're detaching because CKEditor as text editor has been disabled; this
      // really means that all CKEditor toolbar buttons have been removed. Hence,
      // all editor features will be removed, so any reactions from filters will
      // be undone.
      var $configurationForm = $(context).find('.ckeditor-toolbar-configuration.ckeditor-configuration-processed');
      if ($configurationForm.length && Drupal.ckeditor.models && Drupal.ckeditor.models.configurationModel) {
        var config = Drupal.ckeditor.models.configurationModel.toJSON().activeEditorConfig;
        var buttons = Drupal.ckeditor.views.controller.getButtonList(config);
        var $activeToolbar = $('.ckeditor-toolbar-configuration').find('.ckeditor-toolbar-active');
        for (var i = 0; i < buttons.length; i++) {
          $activeToolbar.trigger('CKEditorToolbarChanged', ['removed', buttons[i]]);
        }
      }
    }
  };

  /**
   * CKEditor configuration UI methods of Backbone objects.
   */
  Drupal.ckeditor = {

    // A hash of View instances.
    views: {},

    // A hash of Model instances.
    models: {},

    /**
     * Backbone model for the CKEditor toolbar configuration state.
     */
    ConfigurationModel: Backbone.Model.extend({
      defaults: {
        // The CKEditor configuration that is being manipulated through the UI.
        activeEditorConfig: null,
        // The textarea that contains the serialized representation of the active
        // CKEditor configuration.
        $textarea: null,
        // Tracks whether the active toolbar DOM structure has been changed. When
        // true, activeEditorConfig needs to be updated, and when that is updated,
        // $textarea will also be updated.
        isDirty: false,
        // The configuration for the hidden CKEditor instance that is used to build
        // the features metadata.
        hiddenEditorConfig: null,
        // A hash, keyed by a feature name, that details CKEditor plugin features.
        featuresMetadata: null,
        // Whether the button group names are currently visible.
        groupNamesVisible: false
      },
      sync: function () {
        // Push the settings into the textarea.
        this.get('$textarea').val(JSON.stringify(this.get('activeEditorConfig')));
      }
    }),

    /**
     * Backbone View acting as a controller for CKEditor toolbar configuration.
     */
    ConfigurationController: Backbone.View.extend({

      events: {},

      /**
       * {@inheritdoc}
       */
      initialize: function () {
        this.getCKEditorFeatures(this.model.get('hiddenEditorConfig'), this.disableFeaturesDisallowedByFilters.bind(this));

        // Push the active editor configuration to the textarea.
        this.model.listenTo(this.model, 'change:activeEditorConfig', this.model.sync);
        this.listenTo(this.model, 'change:isDirty', this.parseEditorDOM);
      },

      /**
       * Converts the active toolbar DOM structure to an object representation.
       *
       * @param Drupal.ckeditor.ConfigurationModel model
       *   The state model for the CKEditor configuration.
       * @param Boolean isDirty
       *   Tracks whether the active toolbar DOM structure has been changed.
       *   isDirty is toggled back to false in this method.
       * @param Object options
       *   An object that includes:
       *   - Boolean broadcast: (optional) A flag that controls whether a
       *     CKEditorToolbarChanged event should be fired for configuration
       *     changes.
       */
      parseEditorDOM: function (model, isDirty, options) {
        if (isDirty) {
          var currentConfig = this.model.get('activeEditorConfig');

          // Process the rows.
          var rows = [];
          this.$el
            .find('.ckeditor-active-toolbar-configuration')
            .children('.ckeditor-row').each(function () {
              var groups = [];
              // Process the button groups.
              $(this).find('.ckeditor-toolbar-group').each(function () {
                var $group = $(this);
                var $buttons = $group.find('.ckeditor-button');
                if ($buttons.length) {
                  var group = {
                    name: $group.attr('data-drupal-ckeditor-toolbar-group-name'),
                    items: []
                  };
                  $group.find('.ckeditor-button, .ckeditor-multiple-button').each(function () {
                    group.items.push($(this).attr('data-drupal-ckeditor-button-name'));
                  });
                  groups.push(group);
                }
              });
              if (groups.length) {
                rows.push(groups);
              }
            });
          this.model.set('activeEditorConfig', rows);
          // Mark the model as clean. Whether or not the sync to the textfield
          // occurs depends on the activeEditorConfig attribute firing a change
          // event. The DOM has at least been processed and posted, so as far as
          // the model is concerned, it is clean.
          this.model.set('isDirty', false);

          // Determine whether we should trigger an event.
          if (options.broadcast !== false) {
            var prev = this.getButtonList(currentConfig);
            var next = this.getButtonList(rows);
            if (prev.length !== next.length) {
              this.$el
                .find('.ckeditor-toolbar-active')
                .trigger('CKEditorToolbarChanged', [
                  (prev.length < next.length) ? 'added' : 'removed',
                  _.difference(_.union(prev, next), _.intersection(prev, next))[0]
                ]);
            }
          }
        }
      },

      /**
       * Asynchronously retrieve the metadata for all available CKEditor features.
       *
       * In order to get a list of all features needed by CKEditor, we create a
       * hidden CKEditor instance, then check the CKEditor's "allowedContent"
       * filter settings. Because creating an instance is expensive, a callback
       * must be provided that will receive a hash of Drupal.EditorFeature
       * features keyed by feature (button) name.
       *
       * @param Object CKEditorConfig
       *   An object that represents the configuration settings for a CKEditor
       *   editor component.
       * @param Function callback
       *   A function to invoke when the instanceReady event is fired by the
       *   CKEditor object.
       */
      getCKEditorFeatures: function (CKEditorConfig, callback) {
        var getProperties = function (CKEPropertiesList) {
          return (_.isObject(CKEPropertiesList)) ? _.keys(CKEPropertiesList) : [];
        };

        var convertCKERulesToEditorFeature = function (feature, CKEFeatureRules) {
          for (var i = 0; i < CKEFeatureRules.length; i++) {
            var CKERule = CKEFeatureRules[i];
            var rule = new Drupal.EditorFeatureHTMLRule();

            // Tags.
            var tags = getProperties(CKERule.elements);
            rule.required.tags = (CKERule.propertiesOnly) ? [] : tags;
            rule.allowed.tags = tags;
            // Attributes.
            rule.required.attributes = getProperties(CKERule.requiredAttributes);
            rule.allowed.attributes = getProperties(CKERule.attributes);
            // Styles.
            rule.required.styles = getProperties(CKERule.requiredStyles);
            rule.allowed.styles = getProperties(CKERule.styles);
            // Classes.
            rule.required.classes = getProperties(CKERule.requiredClasses);
            rule.allowed.classes = getProperties(CKERule.classes);
            // Raw.
            rule.raw = CKERule;

            feature.addHTMLRule(rule);
          }
        };

        // Create hidden CKEditor with all features enabled, retrieve metadata.
        // @see \Drupal\ckeditor\Plugin\Editor\CKEditor::settingsForm.
        var hiddenCKEditorID = 'ckeditor-hidden';
        if (CKEDITOR.instances[hiddenCKEditorID]) {
          CKEDITOR.instances[hiddenCKEditorID].destroy(true);
        }
        // Load external plugins, if any.
        var hiddenEditorConfig = this.model.get('hiddenEditorConfig');
        if (hiddenEditorConfig.drupalExternalPlugins) {
          var externalPlugins = hiddenEditorConfig.drupalExternalPlugins;
          for (var pluginName in externalPlugins) {
            if (externalPlugins.hasOwnProperty(pluginName)) {
              CKEDITOR.plugins.addExternal(pluginName, externalPlugins[pluginName], '');
            }
          }
        }
        CKEDITOR.inline($('#' + hiddenCKEditorID).get(0), CKEditorConfig);

        // Once the instance is ready, retrieve the allowedContent filter rules
        // and convert them to Drupal.EditorFeature objects.
        CKEDITOR.once('instanceReady', function (e) {
          if (e.editor.name === hiddenCKEditorID) {
            // First collect all CKEditor allowedContent rules.
            var CKEFeatureRulesMap = {};
            var rules = e.editor.filter.allowedContent;
            var rule, name;
            for (var i = 0; i < rules.length; i++) {
              rule = rules[i];
              name = rule.featureName || ':(';
              if (!CKEFeatureRulesMap[name]) {
                CKEFeatureRulesMap[name] = [];
              }
              CKEFeatureRulesMap[name].push(rule);
            }

            // Now convert these to Drupal.EditorFeature objects.
            var features = {};
            for (var featureName in CKEFeatureRulesMap) {
              if (CKEFeatureRulesMap.hasOwnProperty(featureName)) {
                var feature = new Drupal.EditorFeature(featureName);
                convertCKERulesToEditorFeature(feature, CKEFeatureRulesMap[featureName]);
                features[featureName] = feature;
              }
            }

            callback(features);
          }
        });
      },

      /**
       * Retrieves the feature for a given button from featuresMetadata. Returns
       * false if the given button is in fact a divider.
       *
       * @param String button
       *   The name of a CKEditor button.
       * @return Object
       *   The feature metadata object for a button.
       */
      getFeatureForButton: function (button) {
        // Return false if the button being added is a divider.
        if (button === '-') {
          return false;
        }

        // Get a Drupal.editorFeature object that contains all metadata for
        // the feature that was just added or removed. Not every feature has
        // such metadata.
        var featureName = button.toLowerCase();
        var featuresMetadata = this.model.get('featuresMetadata');
        if (!featuresMetadata[featureName]) {
          featuresMetadata[featureName] = new Drupal.EditorFeature(featureName);
          this.model.set('featuresMetadata', featuresMetadata);
        }
        return featuresMetadata[featureName];
      },

      /**
       * Checks buttons against filter settings; disables disallowed buttons.
       *
       * @param Object features
       *   A map of Drupal.EditorFeature objects.
       */
      disableFeaturesDisallowedByFilters: function (features) {
        this.model.set('featuresMetadata', features);

        // Ensure that toolbar configuration changes are broadcast.
        this.broadcastConfigurationChanges(this.$el);

        // Initialization: not all of the default toolbar buttons may be allowed
        // by the current filter settings. Remove any of the default toolbar
        // buttons that require more permissive filter settings. The remaining
        // default toolbar buttons are marked as "added".
        var existingButtons = [];
        // Loop through each button group after flattening the groups from the
        // toolbar row arrays.
        for (var i = 0, buttonGroups = _.flatten(this.model.get('activeEditorConfig')); i < buttonGroups.length; i++) {
          // Pull the button names from each toolbar button group.
          for (var k = 0, buttons = buttonGroups[i].items; k < buttons.length; k++) {
            existingButtons.push(buttons[k]);
          }
        }
        // Remove duplicate buttons.
        existingButtons = _.unique(existingButtons);
        // Prepare the active toolbar and available-button toolbars.
        for (i = 0; i < existingButtons.length; i++) {
          var button = existingButtons[i];
          var feature = this.getFeatureForButton(button);
          // Skip dividers.
          if (feature === false) {
            continue;
          }

          if (Drupal.editorConfiguration.featureIsAllowedByFilters(feature)) {
            // Existing toolbar buttons are in fact "added features".
            this.$el.find('.ckeditor-toolbar-active').trigger('CKEditorToolbarChanged', ['added', existingButtons[i]]);
          }
          else {
            // Move the button element from the active the active toolbar to the
            // list of available buttons.
            $('.ckeditor-toolbar-active li[data-drupal-ckeditor-button-name="' + button + '"]')
              .detach()
              .appendTo('.ckeditor-toolbar-disabled > .ckeditor-toolbar-available > ul');
            // Update the toolbar value field.
            this.model.set({'isDirty': true}, {broadcast: false});
          }
        }
      },

      /**
       * Sets up broadcasting of CKEditor toolbar configuration changes.
       *
       * @param jQuery $ckeditorToolbar
       *   The active toolbar DOM element wrapped in jQuery.
       */
      broadcastConfigurationChanges: function ($ckeditorToolbar) {
        var view = this;
        var hiddenEditorConfig = this.model.get('hiddenEditorConfig');
        var featuresMetadata = this.model.get('featuresMetadata');
        var getFeatureForButton = this.getFeatureForButton.bind(this);
        var getCKEditorFeatures = this.getCKEditorFeatures.bind(this);
        $ckeditorToolbar
          .find('.ckeditor-toolbar-active')
          // Listen for CKEditor toolbar configuration changes. When a button is
          // added/removed, call an appropriate Drupal.editorConfiguration method.
          .on('CKEditorToolbarChanged.ckeditorAdmin', function (event, action, button) {
            var feature = getFeatureForButton(button);

            // Early-return if the button being added is a divider.
            if (feature === false) {
              return;
            }

            // Trigger a standardized text editor configuration event to indicate
            // whether a feature was added or removed, so that filters can react.
            var configEvent = (action === 'added') ? 'addedFeature' : 'removedFeature';
            Drupal.editorConfiguration[configEvent](feature);
          })
          // Listen for CKEditor plugin settings changes. When a plugin setting is
          // changed, rebuild the CKEditor features metadata.
          .on('CKEditorPluginSettingsChanged.ckeditorAdmin', function (event, settingsChanges) {
            // Update hidden CKEditor configuration.
            for (var key in settingsChanges) {
              if (settingsChanges.hasOwnProperty(key)) {
                hiddenEditorConfig[key] = settingsChanges[key];
              }
            }

            // Retrieve features for the updated hidden CKEditor configuration.
            getCKEditorFeatures(hiddenEditorConfig, function (features) {
              // Trigger a standardized text editor configuration event for each
              // feature that was modified by the configuration changes.
              for (var name in features) {
                if (features.hasOwnProperty(name)) {
                  var feature = features[name];
                  if (featuresMetadata.hasOwnProperty(name) && !_.isEqual(featuresMetadata[name], feature)) {
                    Drupal.editorConfiguration.modifiedFeature(feature);
                  }
                }
              }
              // Update the CKEditor features metadata.
              view.model.set('featuresMetadata', features);
            });
          });
      },

      /**
       * Returns the list of buttons from an editor configuration.
       *
       * @param Object config
       *   A CKEditor configuration object.
       * @return Array
       *   A list of buttons in the CKEditor configuration.
       */
      getButtonList: function (config) {
        var buttons = [];
        // Remove the rows
        config = _.flatten(config);

        // Loop through the button groups and pull out the buttons.
        config.forEach(function (group) {
          group.items.forEach(function (button) {
            buttons.push(button);
          });
        });

        // Remove the dividing elements if any.
        return _.without(buttons, '-');
      }
    }),

    /**
     * Backbone View for CKEditor toolbar configuration; visual UX.
     */
    ConfigurationVisualView: Backbone.View.extend({

      events: {
        'click .ckeditor-toolbar-group-name': 'onGroupNameClick',
        'click .ckeditor-groupnames-toggle': 'onGroupNamesToggleClick',
        'click .ckeditor-add-new-group button': 'onAddGroupButtonClick'
      },

      /**
       * {@inheritdoc}
       */
      initialize: function () {
        this.listenTo(this.model, 'change:isDirty change:groupNamesVisible', this.render);

        // Add a toggle for the button group names.
        $(Drupal.theme('ckeditorButtonGroupNamesToggle'))
          .prependTo(this.$el.find('#ckeditor-active-toolbar').parent());

        this.render();
      },

      /**
       * {@inheritdoc}
       */
      render: function (model, value, changedAttributes) {
        this.insertPlaceholders();
        this.applySorting();

        // Toggle button group names.
        var groupNamesVisible = this.model.get('groupNamesVisible');
        // If a button was just placed in the active toolbar, ensure that the
        // button group names are visible.
        if (changedAttributes && changedAttributes.changes && changedAttributes.changes.isDirty) {
          this.model.set({groupNamesVisible: true}, {silent: true});
          groupNamesVisible = true;
        }
        this.$el.find('[data-toolbar="active"]').toggleClass('ckeditor-group-names-are-visible', groupNamesVisible);
        this.$el.find('.ckeditor-groupnames-toggle')
          .text((groupNamesVisible) ? Drupal.t('Hide group names') : Drupal.t('Show group names'))
          .attr('aria-pressed', groupNamesVisible);

        return this;
      },

      /**
       * Handles clicks to a button group name.
       *
       * @param jQuery.Event event
       */
      onGroupNameClick: function (event) {
        var $group = $(event.currentTarget).closest('.ckeditor-toolbar-group');
        openGroupNameDialog(this, $group);

        event.stopPropagation();
        event.preventDefault();
      },

      /**
       * Handles clicks on the button group names toggle button.
       */
      onGroupNamesToggleClick: function (event) {
        this.model.set('groupNamesVisible', !this.model.get('groupNamesVisible'));
        event.preventDefault();
      },

      /**
       * Prompts the user to provide a name for a new button group; inserts it.
       *
       * @param jQuery.Event event
       */
      onAddGroupButtonClick: function (event) {

        /**
         * Inserts a new button if the openGroupNameDialog function returns true.
         *
         * @param Boolean success
         *   A flag that indicates if the user created a new group (true) or
         *   canceled out of the dialog (false).
         * @param jQuery $group
         *   A jQuery DOM fragment that represents the new button group. It has
         *   not been added to the DOM yet.
         */
        function insertNewGroup (success, $group) {
          if (success) {
            $group.appendTo($(event.currentTarget).closest('.ckeditor-row').children('.ckeditor-toolbar-groups'));
            // Focus on the new group.
            $group.trigger('focus');
          }
        }

        // Pass in a DOM fragment of a placeholder group so that the new group
        // name can be applied to it.
        openGroupNameDialog(this, $(Drupal.theme('ckeditorToolbarGroup')), insertNewGroup);

        event.preventDefault();
      },

      /**
       * Handles jQuery Sortable stop sort of a button group.
       *
       * @param jQuery.Event event
       * @param Object ui
       *   A jQuery.ui.sortable argument that contains information about the
       *   elements involved in the sort action.
       */
      endGroupDrag: function (event, ui) {
        var view = this;
        registerGroupMove(this, ui.item, function (success) {
          if (!success) {
            // Cancel any sorting in the configuration area.
            view.$el.find('.ckeditor-toolbar-configuration').find('.ui-sortable').sortable('cancel');
          }
        });
      },

      /**
       * Handles jQuery Sortable start sort of a button.
       *
       * @param jQuery.Event event
       * @param Object ui
       *   A jQuery.ui.sortable argument that contains information about the
       *   elements involved in the sort action.
       */
      startButtonDrag: function (event, ui) {
        this.$el.find('a:focus').trigger('blur');

        // Show the button group names as soon as the user starts dragging.
        this.model.set('groupNamesVisible', true);
      },

      /**
       * Handles jQuery Sortable stop sort of a button.
       *
       * @param jQuery.Event event
       * @param Object ui
       *   A jQuery.ui.sortable argument that contains information about the
       *   elements involved in the sort action.
       */
      endButtonDrag: function (event, ui) {
        var view = this;
        registerButtonMove(this, ui.item, function (success) {
          if (!success) {
            // Cancel any sorting in the configuration area.
            view.$el.find('.ui-sortable').sortable('cancel');
          }
          // Refocus the target button so that the user can continue from a known
          // place.
          ui.item.find('a').trigger('focus');
        });
      },

      /**
       * Invokes jQuery.sortable() on new buttons and groups in a CKEditor config.
       */
      applySorting: function () {
        // Make the buttons sortable.
        this.$el.find('.ckeditor-buttons').not('.ui-sortable').sortable({
          // Change this to .ckeditor-toolbar-group-buttons.
          connectWith: '.ckeditor-buttons',
          placeholder: 'ckeditor-button-placeholder',
          forcePlaceholderSize: true,
          tolerance: 'pointer',
          cursor: 'move',
          start: this.startButtonDrag.bind(this),
          // Sorting within a sortable.
          stop: this.endButtonDrag.bind(this)
        }).disableSelection();

        // Add the drag and drop functionality to button groups.
        this.$el.find('.ckeditor-toolbar-groups').not('.ui-sortable').sortable({
          connectWith: '.ckeditor-toolbar-groups',
          cancel: '.ckeditor-add-new-group',
          placeholder: 'ckeditor-toolbar-group-placeholder',
          forcePlaceholderSize: true,
          cursor: 'move',
          stop: this.endGroupDrag.bind(this)
        });

        // Add the drag and drop functionality to buttons.
        this.$el.find('.ckeditor-multiple-buttons li').draggable({
          connectToSortable: '.ckeditor-toolbar-active .ckeditor-buttons',
          helper: 'clone'
        });
      },

      /**
       * Wraps the invocation of methods to insert blank groups and rows.
       */
      insertPlaceholders: function () {
        this.insertPlaceholderRow();
        this.insertNewGroupButtons();
      },

      /**
       * Inserts a blank row at the bottom of the CKEditor configuration.
       */
      insertPlaceholderRow: function () {
        var $rows = this.$el.find('.ckeditor-row');
        // Add a placeholder row. to the end of the list if one does not exist.
        if (!$rows.eq(-1).hasClass('placeholder')) {
          this.$el
            .find('.ckeditor-toolbar-active')
            .children('.ckeditor-active-toolbar-configuration')
            .append(Drupal.theme('ckeditorRow'));
        }
        // Update the $rows variable to include the new row.
        $rows = this.$el.find('.ckeditor-row');
        // Remove blank rows except the last one.
        var len = $rows.length;
        $rows.filter(function (index, row) {
          // Do not remove the last row.
          if (index + 1 === len) {
            return false;
          }
          return $(row).find('.ckeditor-toolbar-group').not('.placeholder').length === 0;
        })
          // Then get all rows that are placeholders and remove them.
          .remove();
      },

      /**
       * Inserts a button in each row that will add a new CKEditor button group.
       */
      insertNewGroupButtons: function () {
        // Insert an add group button to each row.
        this.$el.find('.ckeditor-row').each(function () {
          var $row = $(this);
          var $groups = $row.find('.ckeditor-toolbar-group');
          var $button = $row.find('.ckeditor-add-new-group');
          if ($button.length === 0) {
            $row.children('.ckeditor-toolbar-groups').append(Drupal.theme('ckeditorNewButtonGroup'));
          }
          // If a placeholder group exists, make sure it's at the end of the row.
          else if (!$groups.eq(-1).hasClass('ckeditor-add-new-group')) {
            $button.appendTo($row.children('.ckeditor-toolbar-groups'));
          }
        });
      }
    }),

    /**
     * Backbone View for CKEditor toolbar configuration; keyboard UX.
     */
    ConfigurationKeyboardView: Backbone.View.extend({

      /**
       * {@inheritdoc}
       */
      initialize: function () {
        // Add keyboard arrow support.
        this.$el.on('keydown.ckeditor', '.ckeditor-buttons a, .ckeditor-multiple-buttons a', this.onPressButton.bind(this));
        this.$el.on('keydown.ckeditor', '[data-drupal-ckeditor-type="group"]', this.onPressGroup.bind(this));
      },

      /**
       * {@inheritdoc}
       */
      render: function () {},

      /**
       * Handles keypresses on a CKEditor configuration button.
       *
       * @param jQuery.Event event
       */
      onPressButton: function (event) {
        var upDownKeys = [
          38, // Up arrow.
          63232, // Safari up arrow.
          40, // Down arrow.
          63233 // Safari down arrow.
        ];
        var leftRightKeys = [
          37, // Left arrow.
          63234, // Safari left arrow.
          39, // Right arrow.
          63235 // Safari right arrow.
        ];

        // Respond to an enter key press. Prevent the bubbling of the enter key
        // press to the button group parent element.
        if (event.keyCode === 13) {
          event.stopPropagation();
        }

        // Only take action when a direction key is pressed.
        if (_.indexOf(_.union(upDownKeys, leftRightKeys), event.keyCode) > -1) {
          var view = this;
          var $target = $(event.currentTarget);
          var $button = $target.parent();
          var $container = $button.parent();
          var $group = $button.closest('.ckeditor-toolbar-group');
          var $row = $button.closest('.ckeditor-row');
          var containerType = $container.data('drupal-ckeditor-button-sorting');
          var $availableButtons = this.$el.find('[data-drupal-ckeditor-button-sorting="source"]');
          var $activeButtons = this.$el.find('.ckeditor-toolbar-active');
          // The current location of the button, just in case it needs to be put
          // back.
          var $originalGroup = $group;
          var dir;

          // Move available buttons between their container and the active toolbar.
          if (containerType === 'source') {
            // Move the button to the active toolbar configuration when the down or
            // up keys are pressed.
            if (_.indexOf([40, 63233], event.keyCode) > -1) {
              // Move the button to the first row, first button group index
              // position.
              $activeButtons.find('.ckeditor-toolbar-group-buttons').eq(0).prepend($button);
            }
          }
          else if (containerType === 'target') {
            // Move buttons between sibling buttons in a group and between groups.
            if (_.indexOf(leftRightKeys, event.keyCode) > -1) {
              // Move left.
              var $siblings = $container.children();
              var index = $siblings.index($button);
              if (_.indexOf([37, 63234], event.keyCode) > -1) {
                // Move between sibling buttons.
                if (index > 0) {
                  $button.insertBefore($container.children().eq(index - 1));
                }
                // Move between button groups and rows.
                else {
                  // Move between button groups.
                  $group = $container.parent().prev();
                  if ($group.length > 0) {
                    $group.find('.ckeditor-toolbar-group-buttons').append($button);
                  }
                  // Wrap between rows.
                  else {
                    $container.closest('.ckeditor-row').prev().find('.ckeditor-toolbar-group').not('.placeholder').find('.ckeditor-toolbar-group-buttons').eq(-1).append($button);
                  }
                }
              }
              // Move right.
              else if (_.indexOf([39, 63235], event.keyCode) > -1) {
                // Move between sibling buttons.
                if (index < ($siblings.length - 1)) {
                  $button.insertAfter($container.children().eq(index + 1));
                }
                // Move between button groups. Moving right at the end of a row
                // will create a new group.
                else {
                  $container.parent().next().find('.ckeditor-toolbar-group-buttons').prepend($button);
                }
              }
            }
            // Move buttons between rows and the available button set.
            else if (_.indexOf(upDownKeys, event.keyCode) > -1) {
              dir = (_.indexOf([38, 63232], event.keyCode) > -1) ? 'prev' : 'next';
              $row = $container.closest('.ckeditor-row')[dir]();
              // Move the button back into the available button set.
              if (dir === 'prev' && $row.length === 0) {
                // If this is a divider, just destroy it.
                if ($button.data('drupal-ckeditor-type') === 'separator') {
                  $button
                    .off()
                    .remove();
                  // Focus on the first button in the active toolbar.
                  $activeButtons.find('.ckeditor-toolbar-group-buttons').eq(0).children().eq(0).children().trigger('focus');
                }
                // Otherwise, move it.
                else {
                  $availableButtons.prepend($button);
                }
              }
              else {
                $row.find('.ckeditor-toolbar-group-buttons').eq(0).prepend($button);
              }
            }
          }
          // Move dividers between their container and the active toolbar.
          else if (containerType === 'dividers') {
            // Move the button to the active toolbar configuration when the down or
            // up keys are pressed.
            if (_.indexOf([40, 63233], event.keyCode) > -1) {
              // Move the button to the first row, first button group index
              // position.
              $button = $button.clone(true);
              $activeButtons.find('.ckeditor-toolbar-group-buttons').eq(0).prepend($button);
              $target = $button.children();
            }
          }

          view = this;
          // Attempt to move the button to the new toolbar position.
          registerButtonMove(this, $button, function (result) {

            // Put the button back if the registration failed.
            // If the button was in a row, then it was in the active toolbar
            // configuration. The button was probably placed in a new group, but
            // that action was canceled.
            if (!result && $originalGroup) {
              $originalGroup.find('.ckeditor-buttons').append($button);
            }
            // Otherwise refresh the sortables to acknowledge the new button
            // positions.
            else {
              view.$el.find('.ui-sortable').sortable('refresh');
            }
            // Refocus the target button so that the user can continue from a known
            // place.
            $target.trigger('focus');
          });

          event.preventDefault();
          event.stopPropagation();
        }
      },

      /**
       * Handles keypresses on a CKEditor configuration group.
       *
       * @param jQuery.Event event
       */
      onPressGroup: function (event) {
        var upDownKeys = [
          38, // Up arrow.
          63232, // Safari up arrow.
          40, // Down arrow.
          63233 // Safari down arrow.
        ];
        var leftRightKeys = [
          37, // Left arrow.
          63234, // Safari left arrow.
          39, // Right arrow.
          63235 // Safari right arrow.
        ];

        // Respond to an enter key press.
        if (event.keyCode === 13) {
          var view = this;
          // Open the group renaming dialog in the next evaluation cycle so that
          // this event can be cancelled and the bubbling wiped out. Otherwise,
          // Firefox has issues because the page focus is shifted to the dialog
          // along with the keydown event.
          window.setTimeout(function () {
            openGroupNameDialog(view, $(event.currentTarget));
          }, 0);
          event.preventDefault();
          event.stopPropagation();
        }

        // Respond to direction key presses.
        if (_.indexOf(_.union(upDownKeys, leftRightKeys), event.keyCode) > -1) {
          var $group = $(event.currentTarget);
          var $container = $group.parent();
          var $siblings = $container.children();
          var index, dir;
          // Move groups between sibling groups.
          if (_.indexOf(leftRightKeys, event.keyCode) > -1) {
            index = $siblings.index($group);
            // Move left between sibling groups.
            if ((_.indexOf([37, 63234], event.keyCode) > -1)) {
              if (index > 0) {
                $group.insertBefore($siblings.eq(index - 1));
              }
              // Wrap between rows. Insert the group before the placeholder group
              // at the end of the previous row.
              else {
                $group.insertBefore($container.closest('.ckeditor-row').prev().find('.ckeditor-toolbar-groups').children().eq(-1));
              }
            }
            // Move right between sibling groups.
            else if (_.indexOf([39, 63235], event.keyCode) > -1) {
              // Move to the right if the next group is not a placeholder.
              if (!$siblings.eq(index + 1).hasClass('placeholder')) {
                $group.insertAfter($container.children().eq(index + 1));
              }
              // Wrap group between rows.
              else {
                $container.closest('.ckeditor-row').next().find('.ckeditor-toolbar-groups').prepend($group);
              }
            }

          }
          // Move groups between rows.
          else if (_.indexOf(upDownKeys, event.keyCode) > -1) {
            dir = (_.indexOf([38, 63232], event.keyCode) > -1) ? 'prev' : 'next';
            $group.closest('.ckeditor-row')[dir]().find('.ckeditor-toolbar-groups').eq(0).prepend($group);
          }

          registerGroupMove(this, $group);
          $group.trigger('focus');
          event.preventDefault();
          event.stopPropagation();
        }
      }
    }),

    /**
     * Backbone View for CKEditor toolbar configuration; aural UX (output only).
     */
    ConfigurationAuralView: Backbone.View.extend({

      events: {
        'click .ckeditor-buttons a': 'announceButtonHelp',
        'click .ckeditor-multiple-buttons a': 'announceSeparatorHelp',
        'focus .ckeditor-button a': 'onFocus',
        'focus .ckeditor-button-separator a': 'onFocus',
        'focus .ckeditor-toolbar-group': 'onFocus'
      },

      /**
       * {@inheritdoc}
       */
      initialize: function () {
        // Announce the button and group positions when the model is no longer
        // dirty.
        this.listenTo(this.model, 'change:isDirty', this.announceMove);
      },

      /**
       * Calls announce on buttons and groups when their position is changed.
       *
       * @param Drupal.ckeditor.ConfigurationModel model
       * @param Boolean isDirty
       *   A model attribute that indicates if the changed toolbar configuration
       *   has been stored or not.
       */
      announceMove: function (model, isDirty) {
        // Announce the position of a button or group after the model has been
        // updated.
        if (!isDirty) {
          var item = document.activeElement || null;
          if (item) {
            var $item = $(item);
            if ($item.hasClass('ckeditor-toolbar-group')) {
              this.announceButtonGroupPosition($item);
            }
            else if ($item.parent().hasClass('ckeditor-button')) {
              this.announceButtonPosition($item.parent());
            }
          }
        }
      },

      /**
       * Handles the focus event of elements in the active and available toolbars.
       *
       * @param jQuery.Event event
       */
      onFocus: function (event) {
        event.stopPropagation();

        var $originalTarget = $(event.target);
        var $currentTarget = $(event.currentTarget);
        var $parent = $currentTarget.parent();
        if ($parent.hasClass('ckeditor-button') || $parent.hasClass('ckeditor-button-separator')) {
          this.announceButtonPosition($currentTarget.parent());
        }
        else if ($originalTarget.attr('role') !== 'button' && $currentTarget.hasClass('ckeditor-toolbar-group')) {
          this.announceButtonGroupPosition($currentTarget);
        }
      },

      /**
       * Announces the current position of a button group.
       *
       * @param jQuery $group
       *   A jQuery set that contains an li element that wraps a group of buttons.
       */
      announceButtonGroupPosition: function ($group) {
        var $groups = $group.parent().children();
        var $row = $group.closest('.ckeditor-row');
        var $rows = $row.parent().children();
        var position = $groups.index($group) + 1;
        var positionCount = $groups.not('.placeholder').length;
        var row = $rows.index($row) + 1;
        var rowCount = $rows.not('.placeholder').length;
        var text = Drupal.t('@groupName button group in position @position of @positionCount in row @row of @rowCount.', {
          '@groupName': $group.attr('data-drupal-ckeditor-toolbar-group-name'),
          '@position': position,
          '@positionCount': positionCount,
          '@row': row,
          '@rowCount': rowCount
        });
        // If this position is the first in the last row then tell the user that
        // pressing the down arrow key will create a new row.
        if (position === 1 && row === rowCount) {
          text += "\n";
          text += Drupal.t("Press the down arrow key to create a new row.");
        }
        Drupal.announce(text, 'assertive');
      },

      /**
       * Announces current button position.
       *
       * @param jQuery $button
       *   A jQuery set that contains an li element that wraps a button.
       */
      announceButtonPosition: function ($button) {
        var $row = $button.closest('.ckeditor-row');
        var $rows = $row.parent().children();
        var $buttons = $button.closest('.ckeditor-buttons').children();
        var $group = $button.closest('.ckeditor-toolbar-group');
        var $groups = $group.parent().children();
        var groupPosition = $groups.index($group) + 1;
        var groupPositionCount = $groups.not('.placeholder').length;
        var position = $buttons.index($button) + 1;
        var positionCount = $buttons.length;
        var row = $rows.index($row) + 1;
        var rowCount = $rows.not('.placeholder').length;
        // The name of the button separator is 'button separator' and its type
        // is 'separator', so we do not want to print the type of this item,
        // otherwise the UA will speak 'button separator separator'.
        var type = ($button.attr('data-drupal-ckeditor-type') === 'separator') ? '' : Drupal.t('button');
        var text;
        // The button is located in the available button set.
        if ($button.closest('.ckeditor-toolbar-disabled').length > 0) {
          text = Drupal.t('@name @type.', {
            '@name': $button.children().attr('aria-label'),
            '@type': type
          });
          text += "\n" + Drupal.t('Press the down arrow key to activate.');

          Drupal.announce(text, 'assertive');
        }
        // The button is in the active toolbar.
        else if ($group.not('.placeholder').length === 1) {
          text = Drupal.t('@name @type in position @position of @positionCount in @groupName button group in row @row of @rowCount.', {
            '@name': $button.children().attr('aria-label'),
            '@type': type,
            '@position': position,
            '@positionCount': positionCount,
            '@groupName': $group.attr('data-drupal-ckeditor-toolbar-group-name'),
            '@row': row,
            '@rowCount': rowCount
          });
          // If this position is the first in the last row then tell the user that
          // pressing the down arrow key will create a new row.
          if (groupPosition === 1 && position === 1 && row === rowCount) {
            text += "\n";
            text += Drupal.t("Press the down arrow key to create a new button group in a new row.");
          }
          // If this position is the last one in this row then tell the user that
          // moving the button to the next group will create a new group.
          if (groupPosition === groupPositionCount && position === positionCount) {
            text += "\n";
            text += Drupal.t("This is the last group. Move the button forward to create a new group.");
          }
          Drupal.announce(text, 'assertive');
        }
      },

      /**
       * Provides help information when a button is clicked.
       *
       * @param jQuery.Event event
       */
      announceButtonHelp: function (event) {
        var $link = $(event.currentTarget);
        var $button = $link.parent();
        var enabled = $button.closest('.ckeditor-toolbar-active').length > 0;
        var message;

        if (enabled) {
          message = Drupal.t('The "@name" button is currently enabled.', {
            '@name': $link.attr('aria-label')
          });
          message += "\n" + Drupal.t('Use the keyboard arrow keys to change the position of this button.');
          message += "\n" + Drupal.t('Press the up arrow key on the top row to disable the button.');
        }
        else {
          message = Drupal.t('The "@name" button is currently disabled.', {
            '@name': $link.attr('aria-label')
          });
          message += "\n" + Drupal.t('Use the down arrow key to move this button into the active toolbar.');
        }
        Drupal.announce(message);
        event.preventDefault();
      },

      /**
       * Provides help information when a separator is clicked.
       *
       * @param jQuery.Event event
       */
      announceSeparatorHelp: function (event) {
        var $link = $(event.currentTarget);
        var $button = $link.parent();
        var enabled = $button.closest('.ckeditor-toolbar-active').length > 0;
        var message;

        if (enabled) {
          message = Drupal.t('This @name is currently enabled.', {
            '@name': $link.attr('aria-label')
          });
          message += "\n" + Drupal.t('Use the keyboard arrow keys to change the position of this separator.');
        }
        else {
          message = Drupal.t('Separators are used to visually split individual buttons.');
          message += "\n" + Drupal.t('This @name is currently disabled.', {
            '@name': $link.attr('aria-label')
          });
          message += "\n" + Drupal.t('Use the down arrow key to move this separator into the active toolbar.');
          message += "\n" + Drupal.t('You may add multiple separators to each button group.');
        }
        Drupal.announce(message);
        event.preventDefault();
      }
    })
  };

  /**
   * Translates a change in CKEditor config DOM structure into the config model.
   *
   * If the button is moved within an existing group, the DOM structure is simply
   * translated to a configuration model. If the button is moved into a new group
   * placeholder, then a process is launched to name that group before the button
   * move is translated into configuration.
   *
   * @param Backbone.View view
   *   The Backbone View that invoked this function.
   * @param jQuery $button
   *   A jQuery set that contains an li element that wraps a button element.
   * @param function callback
   *   A callback to invoke after the button group naming modal dialog has been
   *   closed.
   */
  function registerButtonMove (view, $button, callback) {
    var $group = $button.closest('.ckeditor-toolbar-group');

    // If dropped in a placeholder button group, the user must name it.
    if ($group.hasClass('placeholder')) {

      if (view.isProcessing) {
        return;
      }
      view.isProcessing = true;

      openGroupNameDialog(view, $group, callback);
    }
    else {
      view.model.set('isDirty', true);
      callback(true);
    }
  }

  /**
   * Translates a change in CKEditor config DOM structure into the config model.
   *
   * Each row has a placeholder group at the end of the row. A user may not move
   * an existing button group past the placeholder group at the end of a row.
   *
   * @param Backbone.View view
   *   The Backbone View that invoked this function.
   * @param jQuery $group
   *   A jQuery set that contains an li element that wraps a group of buttons.
   */
  function registerGroupMove (view, $group) {
    // Remove placeholder classes if necessary.
    var $row = $group.closest('.ckeditor-row');
    if ($row.hasClass('placeholder')) {
      $row.removeClass('placeholder');
    }
    // If there are any rows with just a placeholder group, mark the row as a
    // placeholder.
    $row.parent().children().each(function () {
      var $row = $(this);
      if ($row.find('.ckeditor-toolbar-group').not('.placeholder').length === 0) {
        $row.addClass('placeholder');
      }
    });
    view.model.set('isDirty', true);
  }

  /**
   * Opens a Drupal dialog with a form for changing the title of a button group.
   *
   * @param Backbone.View view
   *   The Backbone View that invoked this function.
   * @param jQuery $group
   *   A jQuery set that contains an li element that wraps a group of buttons.
   * @param function callback
   *   A callback to invoke after the button group naming modal dialog has been
   *   closed.
   */
  function openGroupNameDialog (view, $group, callback) {
    callback = callback || function () {};

    /**
     * Validates the string provided as a button group title.
     *
     * @param DOM form
     *   The form DOM element that contains the input with the new button group
     *   title string.
     * @return Boolean
     *   Returns true when an error exists, otherwise returns false.
     */
    function validateForm (form) {
      if (form.elements[0].value.length === 0) {
        var $form = $(form);
        if (!$form.hasClass('errors')) {
          $form
            .addClass('errors')
            .find('input')
            .addClass('error')
            .attr('aria-invalid', 'true');
          $('<div class=\"description\" >' + Drupal.t('Please provide a name for the button group.') + '</div>').insertAfter(form.elements[0]);
        }
        return true;
      }
      return false;
    }

    /**
     * Attempts to close the dialog; Validates user input.
     *
     * @param String action
     *   The dialog action chosen by the user: 'apply' or 'cancel'.
     * @param DOM form
     *   The form DOM element that contains the input with the new button group
     *   title string.
     */
    function closeDialog (action, form) {

      /**
       * Closes the dialog when the user cancels or supplies valid data.
       */
      function shutdown () {
        dialog.close(action);

        // The processing marker can be deleted since the dialog has been closed.
        delete view.isProcessing;
      }

      /**
       * Applies a string as the name of a CKEditor button group.
       *
       * @param jQuery $group
       *   A jQuery set that contains an li element that wraps a group of buttons.
       * @param String name
       *   The new name of the CKEditor button group.
       */
      function namePlaceholderGroup ($group, name) {
        // If it's currently still a placeholder, then that means we're creating
        // a new group, and we must do some extra work.
        if ($group.hasClass('placeholder')) {
          // Remove all whitespace from the name, lowercase it and ensure
          // HTML-safe encoding, then use this as the group ID for CKEditor
          // configuration UI accessibility purposes only.
          var groupID = 'ckeditor-toolbar-group-aria-label-for-' + Drupal.checkPlain(name.toLowerCase().replace(/ /g, '-'));
          $group
            // Update the group container.
            .removeAttr('aria-label')
            .attr('data-drupal-ckeditor-type', 'group')
            .attr('tabindex', 0)
            // Update the group heading.
            .children('.ckeditor-toolbar-group-name')
            .attr('id', groupID)
            .end()
            // Update the group items.
            .children('.ckeditor-toolbar-group-buttons')
            .attr('aria-labelledby', groupID);
        }

        $group
          .attr('data-drupal-ckeditor-toolbar-group-name', name)
          .children('.ckeditor-toolbar-group-name')
          .text(name);
      }

      // Invoke a user-provided callback and indicate failure.
      if (action === 'cancel') {
        shutdown();
        callback(false, $group);
        return;
      }

      // Validate that a group name was provided.
      if (form && validateForm(form)) {
        return;
      }

      // React to application of a valid group name.
      if (action === 'apply') {
        shutdown();
        // Apply the provided name to the button group label.
        namePlaceholderGroup($group, Drupal.checkPlain(form.elements[0].value));
        // Remove placeholder classes so that new placeholders will be
        // inserted.
        $group.closest('.ckeditor-row.placeholder').addBack().removeClass('placeholder');

        // Invoke a user-provided callback and indicate success.
        callback(true, $group);

        // Signal that the active toolbar DOM structure has changed.
        view.model.set('isDirty', true);
      }
    }

    // Create a Drupal dialog that will get a button group name from the user.
    var $ckeditorButtonGroupNameForm = $(Drupal.theme('ckeditorButtonGroupNameForm'));
    var dialog = Drupal.dialog($ckeditorButtonGroupNameForm.get(0), {
      title: Drupal.t('Button group name'),
      dialogClass: 'ckeditor-name-toolbar-group',
      resizable: false,
      buttons: [
        {
          text: Drupal.t('Apply'),
          click: function () {
            closeDialog('apply', this);
          },
          primary: true
        },
        {
          text: Drupal.t('Cancel'),
          click: function () {
            closeDialog('cancel');
          }
        }
      ],
      open: function () {
        var form = this;
        var $form = $(this);
        var $widget = $form.parent();
        $widget.find('.ui-dialog-titlebar-close').remove();
        // Set a click handler on the input and button in the form.
        $widget.on('keypress.ckeditor', 'input, button', function (event) {
          // React to enter key press.
          if (event.keyCode === 13) {
            var $target = $(event.currentTarget);
            var data = $target.data('ui-button');
            var action = 'apply';
            // Assume 'apply', but take into account that the user might have
            // pressed the enter key on the dialog buttons.
            if (data && data.options && data.options.label) {
              action = data.options.label.toLowerCase();
            }
            closeDialog(action, form);
            event.stopPropagation();
            event.stopImmediatePropagation();
            event.preventDefault();
          }
        });
        // Announce to the user that a modal dialog is open.
        var text = Drupal.t('Editing the name of the new button group in a dialog.');
        if ($group.attr('data-drupal-ckeditor-toolbar-group-name') !== undefined) {
          text = Drupal.t('Editing the name of the "@groupName" button group in a dialog.', {
            '@groupName': $group.attr('data-drupal-ckeditor-toolbar-group-name')
          });
        }
        Drupal.announce(text);
      },
      close: function (event) {
        // Automatically destroy the DOM element that was used for the dialog.
        $(event.target).remove();
      }
    });
    // A modal dialog is used because the user must provide a button group name
    // or cancel the button placement before taking any other action.
    dialog.showModal();

    $(document.querySelector('.ckeditor-name-toolbar-group').querySelector('input'))
      // When editing, set the "group name" input in the form to the current value.
      .attr('value', $group.attr('data-drupal-ckeditor-toolbar-group-name'))
      // Focus on the "group name" input in the form.
      .trigger('focus');
  }

  /**
   * Automatically shows/hides settings of buttons-only CKEditor plugins.
   */
  Drupal.behaviors.ckeditorAdminButtonPluginSettings = {
    attach: function (context) {
      var $context = $(context);
      var $ckeditorPluginSettings = $context.find('#ckeditor-plugin-settings').once('ckeditor-plugin-settings');
      if ($ckeditorPluginSettings.length) {
        // Hide all button-dependent plugin settings initially.
        $ckeditorPluginSettings.find('[data-ckeditor-buttons]').each(function () {
          var $this = $(this);
          if ($this.data('verticalTab')) {
            $this.data('verticalTab').tabHide();
          }
          else {
            // On very narrow viewports, Vertical Tabs are disabled.
            $this.hide();
          }
          $this.data('ckeditorButtonPluginSettingsActiveButtons', []);
        });

        // Whenever a button is added or removed, check if we should show or hide
        // the corresponding plugin settings. (Note that upon initialization, each
        // button that already is part of the toolbar still is considered "added",
        // hence it also works correctly for buttons that were added previously.)
        $context
          .find('.ckeditor-toolbar-active')
          .off('CKEditorToolbarChanged.ckeditorAdminPluginSettings')
          .on('CKEditorToolbarChanged.ckeditorAdminPluginSettings', function (event, action, button) {
            var $pluginSettings = $ckeditorPluginSettings
              .find('[data-ckeditor-buttons~=' + button + ']');

            // No settings for this button.
            if ($pluginSettings.length === 0) {
              return;
            }

            var verticalTab = $pluginSettings.data('verticalTab');
            var activeButtons = $pluginSettings.data('ckeditorButtonPluginSettingsActiveButtons');
            if (action === 'added') {
              activeButtons.push(button);
              // Show this plugin's settings if >=1 of its buttons are active.
              if (verticalTab) {
                verticalTab.tabShow();
              }
              else {
                // On very narrow viewports, Vertical Tabs remain fieldsets.
                $pluginSettings.show();
              }

            }
            else {
              // Remove this button from the list of active buttons.
              activeButtons.splice(activeButtons.indexOf(button), 1);
              // Show this plugin's settings 0 of its buttons are active.
              if (activeButtons.length === 0) {
                if (verticalTab) {
                  verticalTab.tabHide();
                }
                else {
                  // On very narrow viewports, Vertical Tabs are disabled.
                  $pluginSettings.hide();
                }
              }
            }
            $pluginSettings.data('ckeditorButtonPluginSettingsActiveButtons', activeButtons);
          });
      }
    }
  };

  /**
   * Themes a blank CKEditor row.
   *
   * @return String
   */
  Drupal.theme.ckeditorRow = function () {
    return '<li class="ckeditor-row placeholder" role="group"><ul class="ckeditor-toolbar-groups clearfix"></ul></li>';
  };

  /**
   * Themes a blank CKEditor button group.
   *
   * @return String
   */
  Drupal.theme.ckeditorToolbarGroup = function () {
    var group = '';
    group += '<li class="ckeditor-toolbar-group placeholder" role="presentation" aria-label="' + Drupal.t('Place a button to create a new button group.') + '">';
    group += '<h3 class="ckeditor-toolbar-group-name">' + Drupal.t('New group') + '</h3>';
    group += '<ul class="ckeditor-buttons ckeditor-toolbar-group-buttons" role="toolbar" data-drupal-ckeditor-button-sorting="target"></ul>';
    group += '</li>';
    return group;
  };

  /**
   * Themes a form for changing the title of a CKEditor button group.
   *
   * @return String
   */
  Drupal.theme.ckeditorButtonGroupNameForm = function () {
    return '<form><input name="group-name" required="required"></form>';
  };

  /**
   * Themes a button that will toggle the button group names in active config.
   *
   * @return String
   */
  Drupal.theme.ckeditorButtonGroupNamesToggle = function () {
    return '<a class="ckeditor-groupnames-toggle" role="button" aria-pressed="false"></a>';
  };

  /**
   * Themes a button that will prompt the user to name a new button group.
   *
   * @return String
   */
  Drupal.theme.ckeditorNewButtonGroup = function () {
    return '<li class="ckeditor-add-new-group"><button role="button" aria-label="' + Drupal.t('Add a CKEditor button group to the end of this row.') + '">' + Drupal.t('Add group') + '</button></li>';
  };

})(jQuery, Drupal, _, CKEDITOR);
;
(function ($, Modernizr, Drupal) {

  "use strict";

  /**
   * The collapsible details object represents a single collapsible details element.
   */
  function CollapsibleDetails(node) {
    this.$node = $(node);
    this.$node.data('details', this);
    // Expand details if there are errors inside, or if it contains an
    // element that is targeted by the URI fragment identifier.
    var anchor = location.hash && location.hash !== '#' ? ', ' + location.hash : '';
    if (this.$node.find('.error' + anchor).length) {
      this.$node.attr('open', true);
    }
    // Initialize and setup the summary,
    this.setupSummary();
    // Initialize and setup the legend.
    this.setupLegend();
  }

  /**
   * Extend CollapsibleDetails function.
   */
  $.extend(CollapsibleDetails, {
    /**
     * Holds references to instantiated CollapsibleDetails objects.
     */
    instances: []
  });

  /**
   * Extend CollapsibleDetails prototype.
   */
  $.extend(CollapsibleDetails.prototype, {
    /**
     * Initialize and setup summary events and markup.
     */
    setupSummary: function () {
      this.$summary = $('<span class="summary"></span>');
      this.$node
        .on('summaryUpdated', $.proxy(this.onSummaryUpdated, this))
        .trigger('summaryUpdated');
    },
    /**
     * Initialize and setup legend markup.
     */
    setupLegend: function () {
      // Turn the summary into a clickable link.
      var $legend = this.$node.find('> summary');

      $('<span class="details-summary-prefix visually-hidden"></span>')
        .append(this.$node.attr('open') ? Drupal.t('Hide') : Drupal.t('Show'))
        .prependTo($legend)
        .after(document.createTextNode(' '));

      // .wrapInner() does not retain bound events.
      $('<a class="details-title"></a>')
        .attr('href', '#' + this.$node.attr('id'))
        .prepend($legend.contents())
        .appendTo($legend)
        .on('click', $.proxy(this.onLegendClick, this));
      $legend.append(this.$summary);
    },
    /**
     * Handle legend clicks
     */
    onLegendClick: function (e) {
      this.toggle();
      e.preventDefault();
    },
    /**
     * Update summary
     */
    onSummaryUpdated: function () {
      var text = $.trim(this.$node.drupalGetSummary());
      this.$summary.html(text ? ' (' + text + ')' : '');
    },
    /**
     * Toggle the visibility of a details element using smooth animations.
     */
    toggle: function () {
      var isOpen = !!this.$node.attr('open');
      var $summaryPrefix = this.$node.find('> summary span.details-summary-prefix');
      if (isOpen) {
        $summaryPrefix.html(Drupal.t('Show'));
      }
      else {
        $summaryPrefix.html(Drupal.t('Hide'));
      }
      this.$node.attr('open', !isOpen);
    }
  });

  Drupal.behaviors.collapse = {
    attach: function (context) {
      if (Modernizr.details) {
        return;
      }
      var $collapsibleDetails = $(context).find('details').once('collapse');
      if ($collapsibleDetails.length) {
        for (var i = 0; i < $collapsibleDetails.length; i++) {
          CollapsibleDetails.instances.push(new CollapsibleDetails($collapsibleDetails[i]));
        }
      }
    }
  };

  // Expose constructor in the public space.
  Drupal.CollapsibleDetails = CollapsibleDetails;

})(jQuery, Modernizr, Drupal);
;
(function ($, Drupal, drupalSettings) {

  "use strict";

  /**
   * Provides the summary for the "drupalimage" plugin settings vertical tab.
   */
  Drupal.behaviors.ckeditorDrupalImageSettingsSummary = {
    attach: function () {
      $('#edit-editor-settings-plugins-drupalimage').drupalSetSummary(function (context) {
        var root = 'input[name="editor[settings][plugins][drupalimage][image_upload]';
        var $status = $(root + '[status]"]');
        var $maxFileSize = $(root + '[max_size]"]');
        var $maxWidth = $(root + '[max_dimensions][width]"]');
        var $maxHeight = $(root + '[max_dimensions][height]"]');
        var $scheme = $(root + '[scheme]"]:checked');

        var maxFileSize = $maxFileSize.val() ? $maxFileSize.val() : $maxFileSize.attr('placeholder');
        var maxDimensions = ($maxWidth.val() && $maxHeight.val()) ? '(' + $maxWidth.val() + 'x' + $maxHeight.val() + ')' : '';

        if (!$status.is(':checked')) {
          return Drupal.t('Uploads disabled');
        }

        var output = '';
        output += Drupal.t('Uploads enabled, max size: @size @dimensions', { '@size': maxFileSize, '@dimensions': maxDimensions });
        if ($scheme.length) {
          output += '<br />' + $scheme.attr('data-label');
        }
        return output;
      });
    }
  };

})(jQuery, Drupal, drupalSettings);
;
/**
 * Drupal's states library.
 */
(function ($) {

  "use strict";

  /**
   * The base States namespace.
   *
   * Having the local states variable allows us to use the States namespace
   * without having to always declare "Drupal.states".
   */
  var states = Drupal.states = {
    // An array of functions that should be postponed.
    postponed: []
  };

  /**
   * Attaches the states.
   */
  Drupal.behaviors.states = {
    attach: function (context, settings) {
      var $states = $(context).find('[data-drupal-states]');
      var config, state;
      for (var i = 0, il = $states.length; i < il; i += 1) {
        config = JSON.parse($states[i].getAttribute('data-drupal-states'));
        for (state in config) {
          if (config.hasOwnProperty(state)) {
            new states.Dependent({
              element: $($states[i]),
              state: states.State.sanitize(state),
              constraints: config[state]
            });
          }
        }
      }

      // Execute all postponed functions now.
      while (states.postponed.length) {
        (states.postponed.shift())();
      }
    }
  };

  /**
   * Object representing an element that depends on other elements.
   *
   * @param args
   *   Object with the following keys (all of which are required):
   *   - element: A jQuery object of the dependent element
   *   - state: A State object describing the state that is dependent
   *   - constraints: An object with dependency specifications. Lists all elements
   *     that this element depends on. It can be nested and can contain arbitrary
   *     AND and OR clauses.
   */
  states.Dependent = function (args) {
    $.extend(this, { values: {}, oldValue: null }, args);

    this.dependees = this.getDependees();
    for (var selector in this.dependees) {
      if (this.dependees.hasOwnProperty(selector)) {
        this.initializeDependee(selector, this.dependees[selector]);
      }
    }
  };

  /**
   * Comparison functions for comparing the value of an element with the
   * specification from the dependency settings. If the object type can't be
   * found in this list, the === operator is used by default.
   */
  states.Dependent.comparisons = {
    'RegExp': function (reference, value) {
      return reference.test(value);
    },
    'Function': function (reference, value) {
      // The "reference" variable is a comparison function.
      return reference(value);
    },
    'Number': function (reference, value) {
      // If "reference" is a number and "value" is a string, then cast reference
      // as a string before applying the strict comparison in compare(). Otherwise
      // numeric keys in the form's #states array fail to match string values
      // returned from jQuery's val().
      return (typeof value === 'string') ? compare(reference.toString(), value) : compare(reference, value);
    }
  };

  states.Dependent.prototype = {
    /**
     * Initializes one of the elements this dependent depends on.
     *
     * @param selector
     *   The CSS selector describing the dependee.
     * @param dependeeStates
     *   The list of states that have to be monitored for tracking the
     *   dependee's compliance status.
     */
    initializeDependee: function (selector, dependeeStates) {
      var state, self = this;

      function stateEventHandler(e) {
        self.update(e.data.selector, e.data.state, e.value);
      }

      // Cache for the states of this dependee.
      this.values[selector] = {};

      for (var i in dependeeStates) {
        if (dependeeStates.hasOwnProperty(i)) {
          state = dependeeStates[i];
          // Make sure we're not initializing this selector/state combination twice.
          if ($.inArray(state, dependeeStates) === -1) {
            continue;
          }

          state = states.State.sanitize(state);

          // Initialize the value of this state.
          this.values[selector][state.name] = null;

          // Monitor state changes of the specified state for this dependee.
          $(selector).on('state:' + state, {selector: selector, state: state}, stateEventHandler);

          // Make sure the event we just bound ourselves to is actually fired.
          new states.Trigger({ selector: selector, state: state });
        }
      }
    },

    /**
     * Compares a value with a reference value.
     *
     * @param reference
     *   The value used for reference.
     * @param selector
     *   CSS selector describing the dependee.
     * @param state
     *   A State object describing the dependee's updated state.
     *
     * @return
     *   true or false.
     */
    compare: function (reference, selector, state) {
      var value = this.values[selector][state.name];
      if (reference.constructor.name in states.Dependent.comparisons) {
        // Use a custom compare function for certain reference value types.
        return states.Dependent.comparisons[reference.constructor.name](reference, value);
      }
      else {
        // Do a plain comparison otherwise.
        return compare(reference, value);
      }
    },

    /**
     * Update the value of a dependee's state.
     *
     * @param selector
     *   CSS selector describing the dependee.
     * @param state
     *   A State object describing the dependee's updated state.
     * @param value
     *   The new value for the dependee's updated state.
     */
    update: function (selector, state, value) {
      // Only act when the 'new' value is actually new.
      if (value !== this.values[selector][state.name]) {
        this.values[selector][state.name] = value;
        this.reevaluate();
      }
    },

    /**
     * Triggers change events in case a state changed.
     */
    reevaluate: function () {
      // Check whether any constraint for this dependent state is satisifed.
      var value = this.verifyConstraints(this.constraints);

      // Only invoke a state change event when the value actually changed.
      if (value !== this.oldValue) {
        // Store the new value so that we can compare later whether the value
        // actually changed.
        this.oldValue = value;

        // Normalize the value to match the normalized state name.
        value = invert(value, this.state.invert);

        // By adding "trigger: true", we ensure that state changes don't go into
        // infinite loops.
        this.element.trigger({ type: 'state:' + this.state, value: value, trigger: true });
      }
    },

    /**
     * Evaluates child constraints to determine if a constraint is satisfied.
     *
     * @param constraints
     *   A constraint object or an array of constraints.
     * @param selector
     *   The selector for these constraints. If undefined, there isn't yet a
     *   selector that these constraints apply to. In that case, the keys of the
     *   object are interpreted as the selector if encountered.
     *
     * @return
     *   true or false, depending on whether these constraints are satisfied.
     */
    verifyConstraints: function (constraints, selector) {
      var result;
      if ($.isArray(constraints)) {
        // This constraint is an array (OR or XOR).
        var hasXor = $.inArray('xor', constraints) === -1;
        for (var i = 0, len = constraints.length; i < len; i++) {
          if (constraints[i] !== 'xor') {
            var constraint = this.checkConstraints(constraints[i], selector, i);
            // Return if this is OR and we have a satisfied constraint or if this
            // is XOR and we have a second satisfied constraint.
            if (constraint && (hasXor || result)) {
              return hasXor;
            }
            result = result || constraint;
          }
        }
      }
      // Make sure we don't try to iterate over things other than objects. This
      // shouldn't normally occur, but in case the condition definition is bogus,
      // we don't want to end up with an infinite loop.
      else if ($.isPlainObject(constraints)) {
        // This constraint is an object (AND).
        for (var n in constraints) {
          if (constraints.hasOwnProperty(n)) {
            result = ternary(result, this.checkConstraints(constraints[n], selector, n));
            // False and anything else will evaluate to false, so return when any
            // false condition is found.
            if (result === false) { return false; }
          }
        }
      }
      return result;
    },

    /**
     * Checks whether the value matches the requirements for this constraint.
     *
     * @param value
     *   Either the value of a state or an array/object of constraints. In the
     *   latter case, resolving the constraint continues.
     * @param selector
     *   The selector for this constraint. If undefined, there isn't yet a
     *   selector that this constraint applies to. In that case, the state key is
     *   propagates to a selector and resolving continues.
     * @param state
     *   The state to check for this constraint. If undefined, resolving
     *   continues.
     *   If both selector and state aren't undefined and valid non-numeric
     *   strings, a lookup for the actual value of that selector's state is
     *   performed. This parameter is not a State object but a pristine state
     *   string.
     *
     * @return
     *   true or false, depending on whether this constraint is satisfied.
     */
    checkConstraints: function (value, selector, state) {
      // Normalize the last parameter. If it's non-numeric, we treat it either as
      // a selector (in case there isn't one yet) or as a trigger/state.
      if (typeof state !== 'string' || (/[0-9]/).test(state[0])) {
        state = null;
      }
      else if (typeof selector === 'undefined') {
        // Propagate the state to the selector when there isn't one yet.
        selector = state;
        state = null;
      }

      if (state !== null) {
        // constraints is the actual constraints of an element to check for.
        state = states.State.sanitize(state);
        return invert(this.compare(value, selector, state), state.invert);
      }
      else {
        // Resolve this constraint as an AND/OR operator.
        return this.verifyConstraints(value, selector);
      }
    },

    /**
     * Gathers information about all required triggers.
     */
    getDependees: function () {
      var cache = {};
      // Swivel the lookup function so that we can record all available selector-
      // state combinations for initialization.
      var _compare = this.compare;
      this.compare = function (reference, selector, state) {
        (cache[selector] || (cache[selector] = [])).push(state.name);
        // Return nothing (=== undefined) so that the constraint loops are not
        // broken.
      };

      // This call doesn't actually verify anything but uses the resolving
      // mechanism to go through the constraints array, trying to look up each
      // value. Since we swivelled the compare function, this comparison returns
      // undefined and lookup continues until the very end. Instead of lookup up
      // the value, we record that combination of selector and state so that we
      // can initialize all triggers.
      this.verifyConstraints(this.constraints);
      // Restore the original function.
      this.compare = _compare;

      return cache;
    }
  };

  states.Trigger = function (args) {
    $.extend(this, args);

    if (this.state in states.Trigger.states) {
      this.element = $(this.selector);

      // Only call the trigger initializer when it wasn't yet attached to this
      // element. Otherwise we'd end up with duplicate events.
      if (!this.element.data('trigger:' + this.state)) {
        this.initialize();
      }
    }
  };

  states.Trigger.prototype = {
    initialize: function () {
      var trigger = states.Trigger.states[this.state];

      if (typeof trigger === 'function') {
        // We have a custom trigger initialization function.
        trigger.call(window, this.element);
      }
      else {
        for (var event in trigger) {
          if (trigger.hasOwnProperty(event)) {
            this.defaultTrigger(event, trigger[event]);
          }
        }
      }

      // Mark this trigger as initialized for this element.
      this.element.data('trigger:' + this.state, true);
    },

    defaultTrigger: function (event, valueFn) {
      var oldValue = valueFn.call(this.element);

      // Attach the event callback.
      this.element.on(event, $.proxy(function (e) {
        var value = valueFn.call(this.element, e);
        // Only trigger the event if the value has actually changed.
        if (oldValue !== value) {
          this.element.trigger({ type: 'state:' + this.state, value: value, oldValue: oldValue });
          oldValue = value;
        }
      }, this));

      states.postponed.push($.proxy(function () {
        // Trigger the event once for initialization purposes.
        this.element.trigger({ type: 'state:' + this.state, value: oldValue, oldValue: null });
      }, this));
    }
  };

  /**
   * This list of states contains functions that are used to monitor the state
   * of an element. Whenever an element depends on the state of another element,
   * one of these trigger functions is added to the dependee so that the
   * dependent element can be updated.
   */
  states.Trigger.states = {
    // 'empty' describes the state to be monitored
    empty: {
      // 'keyup' is the (native DOM) event that we watch for.
      'keyup': function () {
        // The function associated to that trigger returns the new value for the
        // state.
        return this.val() === '';
      }
    },

    checked: {
      'change': function () {
        // prop() and attr() only takes the first element into account. To support
        // selectors matching multiple checkboxes, iterate over all and return
        // whether any is checked.
        var checked = false;
        this.each(function () {
          // Use prop() here as we want a boolean of the checkbox state.
          // @see http://api.jquery.com/prop/
          checked = $(this).prop('checked');
          // Break the each() loop if this is checked.
          return !checked;
        });
        return checked;
      }
    },

    // For radio buttons, only return the value if the radio button is selected.
    value: {
      'keyup': function () {
        // Radio buttons share the same :input[name="key"] selector.
        if (this.length > 1) {
          // Initial checked value of radios is undefined, so we return false.
          return this.filter(':checked').val() || false;
        }
        return this.val();
      },
      'change': function () {
        // Radio buttons share the same :input[name="key"] selector.
        if (this.length > 1) {
          // Initial checked value of radios is undefined, so we return false.
          return this.filter(':checked').val() || false;
        }
        return this.val();
      }
    },

    collapsed: {
      'collapsed': function (e) {
        return (typeof e !== 'undefined' && 'value' in e) ? e.value : !this.is('[open]');
      }
    }
  };


  /**
   * A state object is used for describing the state and performing aliasing.
   */
  states.State = function (state) {
    // We may need the original unresolved name later.
    this.pristine = this.name = state;

    // Normalize the state name.
    while (true) {
      // Iteratively remove exclamation marks and invert the value.
      while (this.name.charAt(0) === '!') {
        this.name = this.name.substring(1);
        this.invert = !this.invert;
      }

      // Replace the state with its normalized name.
      if (this.name in states.State.aliases) {
        this.name = states.State.aliases[this.name];
      }
      else {
        break;
      }
    }
  };

  /**
   * Creates a new State object by sanitizing the passed value.
   */
  states.State.sanitize = function (state) {
    if (state instanceof states.State) {
      return state;
    }
    else {
      return new states.State(state);
    }
  };

  /**
   * This list of aliases is used to normalize states and associates negated names
   * with their respective inverse state.
   */
  states.State.aliases = {
    'enabled': '!disabled',
    'invisible': '!visible',
    'invalid': '!valid',
    'untouched': '!touched',
    'optional': '!required',
    'filled': '!empty',
    'unchecked': '!checked',
    'irrelevant': '!relevant',
    'expanded': '!collapsed',
    'open': '!collapsed',
    'closed': 'collapsed',
    'readwrite': '!readonly'
  };

  states.State.prototype = {
    invert: false,

    /**
     * Ensures that just using the state object returns the name.
     */
    toString: function () {
      return this.name;
    }
  };

  /**
   * Global state change handlers. These are bound to "document" to cover all
   * elements whose state changes. Events sent to elements within the page
   * bubble up to these handlers. We use this system so that themes and modules
   * can override these state change handlers for particular parts of a page.
   */

  $(document).on('state:disabled', function (e) {
    // Only act when this change was triggered by a dependency and not by the
    // element monitoring itself.
    if (e.trigger) {
      $(e.target)
        .prop('disabled', e.value)
        .closest('.form-item, .form-submit, .form-wrapper').toggleClass('form-disabled', e.value)
        .find('select, input, textarea').prop('disabled', e.value);

      // Note: WebKit nightlies don't reflect that change correctly.
      // See https://bugs.webkit.org/show_bug.cgi?id=23789
    }
  });

  $(document).on('state:required', function (e) {
    if (e.trigger) {
      if (e.value) {
        var $label = $(e.target).attr({ 'required': 'required', 'aria-required': 'aria-required' }).closest('.form-item, .form-wrapper').find('label');
        // Avoids duplicate required markers on initialization.
        if (!$label.hasClass('form-required').length) {
          $label.addClass('form-required');
        }
      }
      else {
        $(e.target).removeAttr('required aria-required').closest('.form-item, .form-wrapper').find('label.form-required').removeClass('form-required');
      }
    }
  });

  $(document).on('state:visible', function (e) {
    if (e.trigger) {
      $(e.target).closest('.form-item, .form-submit, .form-wrapper').toggle(e.value);
    }
  });

  $(document).on('state:checked', function (e) {
    if (e.trigger) {
      $(e.target).prop('checked', e.value);
    }
  });

  $(document).on('state:collapsed', function (e) {
    if (e.trigger) {
      if ($(e.target).is('[open]') === e.value) {
        $(e.target).find('> summary a').trigger('click');
      }
    }
  });


  /**
   * These are helper functions implementing addition "operators" and don't
   * implement any logic that is particular to states.
   */

  // Bitwise AND with a third undefined state.
  function ternary(a, b) {
    return typeof a === 'undefined' ? b : (typeof b === 'undefined' ? a : a && b);
  }

  // Inverts a (if it's not undefined) when invertState is true.
  function invert(a, invertState) {
    return (invertState && typeof a !== 'undefined') ? !a : a;
  }

  // Compares two values while ignoring undefined values.
  function compare(a, b) {
    return (a === b) ? (typeof a === 'undefined' ? a : true) : (typeof a === 'undefined' || typeof b === 'undefined');
  }

})(jQuery);
;
(function ($, Drupal, drupalSettings) {

  "use strict";

  /**
   * Ensures that the "stylescombo" button's metadata remains up-to-date.
   *
   * Triggers the CKEditorPluginSettingsChanged event whenever the "stylescombo"
   * plugin settings change, to ensure that the corresponding feature metadata is
   * immediately updated — i.e. ensure that HTML tags and classes entered here are
   * known to be "required", which may affect filter settings.
   */
  Drupal.behaviors.ckeditorStylesComboSettings = {
    attach: function (context) {
      var $context = $(context);

      // React to changes in the list of user-defined styles: calculate the new
      // stylesSet setting up to 2 times per second, and if it is different, fire
      // the CKEditorPluginSettingsChanged event with the updated parts of the
      // CKEditor configuration. (This will, in turn, cause the hidden CKEditor
      // instance to be updated and a drupalEditorFeatureModified event to fire.)
      var $ckeditorActiveToolbar = $context
        .find('.ckeditor-toolbar-configuration')
        .find('.ckeditor-toolbar-active');
      var previousStylesSet = drupalSettings.ckeditor.hiddenCKEditorConfig.stylesSet;
      var that = this;
      $context.find('[name="editor[settings][plugins][stylescombo][styles]"]')
        .on('blur.ckeditorStylesComboSettings', function () {
          var styles = $.trim($('#edit-editor-settings-plugins-stylescombo-styles').val());
          var stylesSet = that._generateStylesSetSetting(styles);
          if (!_.isEqual(previousStylesSet, stylesSet)) {
            previousStylesSet = stylesSet;
            $ckeditorActiveToolbar.trigger('CKEditorPluginSettingsChanged', [{ stylesSet: stylesSet }]);
          }
        });
    },


    /**
     * Builds the "stylesSet" configuration part of the CKEditor JS settings.
     *
     * @see \Drupal\ckeditor\Plugin\ckeditor\plugin\StylesCombo::generateStylesSetSetting()
     *
     * Note that this is a more forgiving implementation than the PHP version: the
     * parsing works identically, but instead of failing on invalid styles, we
     * just ignore those.
     *
     * @param String sstyles
     *   The "styles" setting.
     *
     * @return array
     *   An array containing the "stylesSet" configuration.
     */
    _generateStylesSetSetting: function (styles) {
      var stylesSet = [];

      styles = styles.replace(/\r/g, "\n");
      var lines = styles.split("\n");
      for (var i = 0; i < lines.length; i++) {
        var style = $.trim(lines[i]);

        // Ignore empty lines in between non-empty lines.
        if (style.length === 0) {
          continue;
        }

        // Validate syntax: element[.class...]|label pattern expected.
        if (style.match(/^ *[a-zA-Z0-9]+ *(\.[a-zA-Z0-9_-]+ *)*\| *.+ *$/) === null) {
          // Instead of failing, we just ignore any invalid styles.
          continue;
        }

        // Parse.
        var parts = style.split('|');
        var selector = parts[0];
        var label = parts[1];
        var classes = selector.split('.');
        var element = classes.shift();

        // Build the data structure CKEditor's stylescombo plugin expects.
        // @see http://docs.cksource.com/CKEditor_3.x/Developers_Guide/Styles
        stylesSet.push({
          attributes: { class: classes.join(' ') },
          element: element,
          name: label
        });
      }

      return stylesSet;
    }
  };

  /**
   * Provides the summary for the "stylescombo" plugin settings vertical tab.
   */
  Drupal.behaviors.ckeditorStylesComboSettingsSummary = {
    attach: function () {
      $('#edit-editor-settings-plugins-stylescombo').drupalSetSummary(function (context) {
        var styles = $.trim($('#edit-editor-settings-plugins-stylescombo-styles').val());
        if (styles.length === 0) {
          return Drupal.t('No styles configured');
        }
        else {
          var count = $.trim(styles).split("\n").length;
          return Drupal.t('@count styles configured', { '@count': count});
        }
      });
    }
  };

})(jQuery, Drupal, drupalSettings);
;
/**
 * @file
 * Attaches behavior for updating filter_html's settings automatically.
 */

(function ($, _, document, window) {

  "use strict";

  /**
   * Implement a live setting parser to prevent text editors from automatically
   * enabling buttons that are not allowed by this filter's configuration.
   */
  if (Drupal.filterConfiguration) {
    Drupal.filterConfiguration.liveSettingParsers.filter_html = {
      getRules: function () {
        var currentValue = $('#edit-filters-filter-html-settings-allowed-html').val();
        var rules = [], rule;

        // Build a FilterHTMLRule that reflects the hard-coded behavior that
        // strips all "style" attribute and all "on*" attributes.
        rule = new Drupal.FilterHTMLRule();
        rule.restrictedTags.tags = ['*'];
        rule.restrictedTags.forbidden.attributes = ['style', 'on*'];
        rules.push(rule);

        // Build a FilterHTMLRule that reflects the current settings.
        rule = new Drupal.FilterHTMLRule();
        var behavior = Drupal.behaviors.filterFilterHtmlUpdating;
        rule.allow = true;
        rule.tags = behavior._parseSetting(currentValue);
        rules.push(rule);

        return rules;
      }
    };
  }

  Drupal.behaviors.filterFilterHtmlUpdating = {

    // The form item containg the "Allowed HTML tags" setting.
    $allowedHTMLFormItem: null,

    // The description for the "Allowed HTML tags" field.
    $allowedHTMLDescription: null,

    // The user-entered tag list of $allowedHTMLFormItem.
    userTags: null,

    // The auto-created tag list thus far added.
    autoTags: null,

    // Track which new features have been added to the text editor.
    newFeatures: {},

    attach: function (context, settings) {
      var that = this;
      $(context).find('[name="filters[filter_html][settings][allowed_html]"]').once('filter-filter_html-updating', function () {
        that.$allowedHTMLFormItem = $(this);
        that.$allowedHTMLDescription = that.$allowedHTMLFormItem.closest('.form-item').find('.description');
        that.userTags = that._parseSetting(this.value);

        // Update the new allowed tags based on added text editor features.
        $(document)
          .on('drupalEditorFeatureAdded', function (e, feature) {
            that.newFeatures[feature.name] = feature.rules;
            that._updateAllowedTags();
          })
          .on('drupalEditorFeatureModified', function (e, feature) {
            if (that.newFeatures.hasOwnProperty(feature.name)) {
              that.newFeatures[feature.name] = feature.rules;
              that._updateAllowedTags();
            }
          })
          .on('drupalEditorFeatureRemoved', function (e, feature) {
            if (that.newFeatures.hasOwnProperty(feature.name)) {
              delete that.newFeatures[feature.name];
              that._updateAllowedTags();
            }
          });

        // When the allowed tags list is manually changed, update userTags.
        that.$allowedHTMLFormItem.on('change.updateUserTags', function () {
          that.userTags = _.difference(that._parseSetting(this.value), that.autoTags);
        });
      });
    },

    /**
     * Updates the "Allowed HTML tags" setting and shows an informative message.
     */
    _updateAllowedTags: function () {
      // Update the list of auto-created tags.
      this.autoTags = this._calculateAutoAllowedTags(this.userTags, this.newFeatures);

      // Remove any previous auto-created tag message.
      this.$allowedHTMLDescription.find('.editor-update-message').remove();

      // If any auto-created tags: insert message and update form item.
      if (this.autoTags.length > 0) {
        this.$allowedHTMLDescription.append(Drupal.theme('filterFilterHTMLUpdateMessage', this.autoTags));
        this.$allowedHTMLFormItem.val(this._generateSetting(this.userTags) + ' ' + this._generateSetting(this.autoTags));
      }
      // Restore to original state.
      else {
        this.$allowedHTMLFormItem.val(this._generateSetting(this.userTags));
      }
    },

    /**
     * Calculates which HTML tags the added text editor buttons need to work.
     *
     * The filter_html filter is only concerned with the required tags, not with
     * any properties, nor with each feature's "allowed" tags.
     *
     * @param Array userAllowedTags
     *   The list of user-defined allowed tags.
     * @param Object newFeatures
     *   A list of Drupal.EditorFeature objects' rules, keyed by their name.
     *
     * @return Array
     *   A list of new allowed tags.
     */
    _calculateAutoAllowedTags: function (userAllowedTags, newFeatures) {
      return _
        .chain(newFeatures)
        // Reduce multiple features' rules.
        .reduce(function (memo, featureRules) {
          // Reduce a single features' rules' required tags.
          return _.union(memo, _.reduce(featureRules, function (memo, featureRule) {
            return _.union(memo, featureRule.required.tags);
          }, []));
        }, [])
        // All new features' required tags are "new allowed tags", except
        // for those that are already allowed in the original allowed tags.
        .difference(userAllowedTags)
        .value();
    },

    /**
     * Parses the value of this.$allowedHTMLFormItem.
     *
     * @param String setting
     *   The string representation of the setting. e.g. "<p> <br> <a>"
     *
     * @return Array
     *   The array representation of the setting. e.g. ['p', 'br', 'a']
     */
    _parseSetting: function (setting) {
      return setting.length ? setting.substring(1, setting.length - 1).split('> <') : [];
    },

    /**
     * Generates the value of this.$allowedHTMLFormItem.
     *
     * @param Array setting
     *   The array representation of the setting. e.g. ['p', 'br', 'a']
     *
     * @return Array
     *   The string representation of the setting. e.g. "<p> <br> <a>"
     */
    _generateSetting: function (tags) {
      return tags.length ? '<' + tags.join('> <') + '>' : '';
    }

  };

  /**
   * Theme function for the filter_html update message.
   *
   * @param Array tags
   *   An array of the new tags that are to be allowed.
   * @return
   *   The corresponding HTML.
   */
  Drupal.theme.filterFilterHTMLUpdateMessage = function (tags) {
    var html = '';
    var tagList = '<' + tags.join('> <') + '>';
    html += '<p class="editor-update-message">';
    html += Drupal.t('Based on the text editor configuration, these tags have automatically been added: <strong>@tag-list</strong>.', { '@tag-list': tagList });
    html += '</p>';
    return html;
  };

})(jQuery, _, document, window);
;
/**
 * @file
 *
 * Replaces the home link in toolbar with a back to site link.
 */
(function ($, Drupal, drupalSettings) {

  "use strict";

  var pathInfo = drupalSettings.path;
  var escapeAdminPath = sessionStorage.getItem('escapeAdminPath');
  var windowLocation = window.location;

  // Saves the last non-administrative page in the browser to be able to link back
  // to it when browsing administrative pages. If there is a destination parameter
  // there is not need to save the current path because the page is loaded within
  // an existing "workflow".
  if (!pathInfo.currentPathIsAdmin && !/destination=/.test(windowLocation.search)) {
    sessionStorage.setItem('escapeAdminPath', windowLocation);
  }

  /**
   * Replaces the "Home" link with "Back to site" link.
   *
   * Back to site link points to the last non-administrative page the user visited
   * within the same browser tab.
   */
  Drupal.behaviors.escapeAdmin = {
    attach: function () {
      var $toolbarEscape = $('[data-toolbar-escape-admin]').once('escapeAdmin');
      if ($toolbarEscape.length) {
        if (pathInfo.currentPathIsAdmin && escapeAdminPath !== null) {
          $toolbarEscape.attr('href', escapeAdminPath);
          $toolbarEscape.closest('.toolbar-tab').removeClass('hidden');
        }
      }
    }
  };

})(jQuery, Drupal, drupalSettings);
;
/**
 * @file
 * Manages page tabbing modifications made by modules.
 */

(function ($, Drupal) {

  "use strict";

  /**
   * Provides an API for managing page tabbing order modifications.
   */
  function TabbingManager() {
    // Tabbing sets are stored as a stack. The active set is at the top of the
    // stack. We use a JavaScript array as if it were a stack; we consider the
    // first element to be the bottom and the last element to be the top. This
    // allows us to use JavaScript's built-in Array.push() and Array.pop()
    // methods.
    this.stack = [];
  }

  /**
   * Add public methods to the TabbingManager class.
   */
  $.extend(TabbingManager.prototype, {
    /**
     * Constrain tabbing to the specified set of elements only.
     *
     * Makes elements outside of the specified set of elements unreachable via the
     * tab key.
     *
     * @param jQuery elements
     *   The set of elements to which tabbing should be constrained. Can also be
     *   a jQuery-compatible selector string.
     *
     * @return TabbingContext
     */
    constrain: function (elements) {
      // Deactivate all tabbingContexts to prepare for the new constraint. A
      // tabbingContext instance will only be reactivated if the stack is unwound
      // to it in the _unwindStack() method.
      for (var i = 0, il = this.stack.length; i < il; i++) {
        this.stack[i].deactivate();
      }

      // The "active tabbing set" are the elements tabbing should be constrained
      // to.
      var $elements = $(elements).find(':tabbable').addBack(':tabbable');

      var tabbingContext = new TabbingContext({
        // The level is the current height of the stack before this new
        // tabbingContext is pushed on top of the stack.
        level: this.stack.length,
        $tabbableElements: $elements
      });

      this.stack.push(tabbingContext);

      // Activates the tabbingContext; this will manipulate the DOM to constrain
      // tabbing.
      tabbingContext.activate();

      // Allow modules to respond to the constrain event.
      $(document).trigger('drupalTabbingConstrained', tabbingContext);

      return tabbingContext;
    },

    /**
     * Restores a former tabbingContext when an active tabbingContext is released.
     *
     * The TabbingManager stack of tabbingContext instances will be unwound from
     * the top-most released tabbingContext down to the first non-released
     * tabbingContext instance. This non-released instance is then activated.
     */
    release: function () {
      // Unwind as far as possible: find the topmost non-released tabbingContext.
      var toActivate = this.stack.length - 1;
      while (toActivate >= 0 && this.stack[toActivate].released) {
        toActivate--;
      }

      // Delete all tabbingContexts after the to be activated one. They have
      // already been deactivated, so their effect on the DOM has been reversed.
      this.stack.splice(toActivate + 1);

      // Get topmost tabbingContext, if one exists, and activate it.
      if (toActivate >= 0) {
        this.stack[toActivate].activate();
      }
    },

    /**
     * Makes all elements outside the of the tabbingContext's set untabbable.
     *
     * Elements made untabble have their original tabindex and autfocus values
     * stored so that they might be restored later when this tabbingContext
     * is deactivated.
     *
     * @param TabbingContext tabbingContext
     *   The TabbingContext instance that has been activated.
     */
    activate: function (tabbingContext) {
      var $set = tabbingContext.$tabbableElements;
      var level = tabbingContext.level;
      // Determine which elements are reachable via tabbing by default.
      var $disabledSet = $(':tabbable')
        // Exclude elements of the active tabbing set.
        .not($set);
      // Set the disabled set on the tabbingContext.
      tabbingContext.$disabledElements = $disabledSet;
      // Record the tabindex for each element, so we can restore it later.
      for (var i = 0, il = $disabledSet.length; i < il; i++) {
        this.recordTabindex($disabledSet.eq(i), level);
      }
      // Make all tabbable elements outside of the active tabbing set unreachable.
      $disabledSet
        .prop('tabindex', -1)
        .prop('autofocus', false);

      // Set focus on an element in the tabbingContext's set of tabbable elements.
      // First, check if there is an element with an autofocus attribute. Select
      // the last one from the DOM order.
      var $hasFocus = $set.filter('[autofocus]').eq(-1);
      // If no element in the tabbable set has an autofocus attribute, select the
      // first element in the set.
      if ($hasFocus.length === 0) {
        $hasFocus = $set.eq(0);
      }
      $hasFocus.trigger('focus');
    },

    /**
     * Restores that tabbable state of a tabbingContext's disabled elements.
     *
     * Elements that were made untabble have their original tabindex and autfocus
     * values restored.
     *
     * @param TabbingContext tabbingContext
     *   The TabbingContext instance that has been deactivated.
     */
    deactivate: function (tabbingContext) {
      var $set = tabbingContext.$disabledElements;
      var level = tabbingContext.level;
      for (var i = 0, il = $set.length; i < il; i++) {
        this.restoreTabindex($set.eq(i), level);
      }
    },

    /**
     * Records the tabindex and autofocus values of an untabbable element.
     *
     * @param jQuery $set
     *   The set of elements that have been disabled.
     * @param Number level
     *   The stack level for which the tabindex attribute should be recorded.
     */
    recordTabindex: function ($el, level) {
      var tabInfo = $el.data('drupalOriginalTabIndices') || {};
      tabInfo[level] = {
        tabindex: $el[0].getAttribute('tabindex'),
        autofocus: $el[0].hasAttribute('autofocus')
      };
      $el.data('drupalOriginalTabIndices', tabInfo);
    },

    /**
     * Restores the tabindex and autofocus values of a reactivated element.
     *
     * @param jQuery $el
     *   The element that is being reactivated.
     * @param Number level
     *   The stack level for which the tabindex attribute should be restored.
     */
    restoreTabindex: function ($el, level) {
      var tabInfo = $el.data('drupalOriginalTabIndices');
      if (tabInfo && tabInfo[level]) {
        var data = tabInfo[level];
        if (data.tabindex) {
          $el[0].setAttribute('tabindex', data.tabindex);
        }
        // If the element did not have a tabindex at this stack level then
        // remove it.
        else {
          $el[0].removeAttribute('tabindex');
        }
        if (data.autofocus) {
          $el[0].setAttribute('autofocus', 'autofocus');
        }

        // Clean up $.data.
        if (level === 0) {
          // Remove all data.
          $el.removeData('drupalOriginalTabIndices');
        }
        else {
          // Remove the data for this stack level and higher.
          var levelToDelete = level;
          while (tabInfo.hasOwnProperty(levelToDelete)) {
            delete tabInfo[levelToDelete];
            levelToDelete++;
          }
          $el.data('drupalOriginalTabIndices', tabInfo);
        }
      }
    }
  });

  /**
   * Stores a set of tabbable elements.
   *
   * This constraint can be removed with the release() method.
   *
   * @param Object options
   *   A set of initiating values that include:
   *   - Number level: The level in the TabbingManager's stack of this
   *   tabbingContext.
   *   - jQuery $tabbableElements: The DOM elements that should be reachable via
   *   the tab key when this tabbingContext is active.
   *   - jQuery $disabledElements: The DOM elements that should not be reachable
   *   via the tab key when this tabbingContext is active.
   *   - Boolean released: A released tabbingContext can never be activated again.
   *   It will be cleaned up when the TabbingManager unwinds its stack.
   *   - Boolean active: When true, the tabbable elements of this tabbingContext
   *   will be reachable via the tab key and the disabled elements will not. Only
   *   one tabbingContext can be active at a time.
   */
  function TabbingContext(options) {
    $.extend(this, {
      level: null,
      $tabbableElements: $(),
      $disabledElements: $(),
      released: false,
      active: false
    }, options);
  }

  /**
   * Add public methods to the TabbingContext class.
   */
  $.extend(TabbingContext.prototype, {
    /**
     * Releases this TabbingContext.
     *
     * Once a TabbingContext object is released, it can never be activated again.
     */
    release: function () {
      if (!this.released) {
        this.deactivate();
        this.released = true;
        Drupal.tabbingManager.release(this);
        // Allow modules to respond to the tabbingContext release event.
        $(document).trigger('drupalTabbingContextReleased', this);
      }
    },

    /**
     * Activates this TabbingContext.
     */
    activate: function () {
      // A released TabbingContext object can never be activated again.
      if (!this.active && !this.released) {
        this.active = true;
        Drupal.tabbingManager.activate(this);
        // Allow modules to respond to the constrain event.
        $(document).trigger('drupalTabbingContextActivated', this);
      }
    },

    /**
     * Deactivates this TabbingContext.
     */
    deactivate: function () {
      if (this.active) {
        this.active = false;
        Drupal.tabbingManager.deactivate(this);
        // Allow modules to respond to the constrain event.
        $(document).trigger('drupalTabbingContextDeactivated', this);
      }
    }
  });


  // Mark this behavior as processed on the first pass and return if it is
  // already processed.
  if (Drupal.tabbingManager) {
    return;
  }
  Drupal.tabbingManager = new TabbingManager();


}(jQuery, Drupal));
;
/**
 * @file
 * Attaches behaviors for the Contextual module's edit toolbar tab.
 */

(function ($, Drupal, Backbone) {

  "use strict";

  var strings = {
    tabbingReleased: Drupal.t('Tabbing is no longer constrained by the Contextual module.'),
    tabbingConstrained: Drupal.t('Tabbing is constrained to a set of @contextualsCount and the edit mode toggle.'),
    pressEsc: Drupal.t('Press the esc key to exit.')
  };

  /**
   * Initializes a contextual link: updates its DOM, sets up model and views
   *
   * @param DOM links
   *   A contextual links DOM element as rendered by the server.
   */
  function initContextualToolbar(context) {
    if (!Drupal.contextual || !Drupal.contextual.collection) {
      return;
    }

    var contextualToolbar = Drupal.contextualToolbar;
    var model = contextualToolbar.model = new contextualToolbar.StateModel({
      // Checks whether localStorage indicates we should start in edit mode
      // rather than view mode.
      // @see Drupal.contextualToolbar.VisualView.persist()
      isViewing: localStorage.getItem('Drupal.contextualToolbar.isViewing') !== 'false'
    }, {
      contextualCollection: Drupal.contextual.collection
    });

    var viewOptions = {
      el: $('.toolbar .toolbar-bar .contextual-toolbar-tab'),
      model: model,
      strings: strings
    };
    new contextualToolbar.VisualView(viewOptions);
    new contextualToolbar.AuralView(viewOptions);
  }

  /**
   * Attaches contextual's edit toolbar tab behavior.
   */
  Drupal.behaviors.contextualToolbar = {
    attach: function (context) {
      if ($('body').once('contextualToolbar-init').length) {
        initContextualToolbar(context);
      }
    }
  };

  Drupal.contextualToolbar = {
    // The Drupal.contextualToolbar.Model instance.
    model: null
  };

})(jQuery, Drupal, Backbone);
;
/**
 * @file
 * A Backbone Model for the state of Contextual module's edit toolbar tab.
 */

(function (Drupal, Backbone) {

  "use strict";

  /**
   * Models the state of the edit mode toggle.
   */
  Drupal.contextualToolbar.StateModel = Backbone.Model.extend({

    defaults: {
      // Indicates whether the toggle is currently in "view" or "edit" mode.
      isViewing: true,
      // Indicates whether the toggle should be visible or hidden. Automatically
      // calculated, depends on contextualCount.
      isVisible: false,
      // Tracks how many contextual links exist on the page.
      contextualCount: 0,
      // A TabbingContext object as returned by Drupal.TabbingManager: the set
      // of tabbable elements when edit mode is enabled.
      tabbingContext: null
    },


    /**
     * {@inheritdoc}
     *
     * @param Object attrs
     * @param Object options
     *   An object with the following option:
     *     - Backbone.collection contextualCollection: the collection of
     *       Drupal.contextual.StateModel models that represent the contextual
     *       links on the page.
     */
    initialize: function (attrs, options) {
      // Respond to new/removed contextual links.
      this.listenTo(options.contextualCollection, {
        'reset remove add': this.countCountextualLinks,
        'add': this.lockNewContextualLinks
      });

      this.listenTo(this, {
        // Automatically determine visibility.
        'change:contextualCount': this.updateVisibility,
        // Whenever edit mode is toggled, lock all contextual links.
        'change:isViewing': function (model, isViewing) {
          options.contextualCollection.each(function (contextualModel) {
            contextualModel.set('isLocked', !isViewing);
          });
        }
      });
    },

    /**
     * Tracks the number of contextual link models in the collection.
     *
     * @param Drupal.contextual.StateModel contextualModel
     *   The contextual links model that was added or removed.
     * @param Backbone.Collection contextualCollection
     *    The collection of contextual link models.
     */
    countCountextualLinks: function (contextualModel, contextualCollection) {
      this.set('contextualCount', contextualCollection.length);
    },

    /**
     * Lock newly added contextual links if edit mode is enabled.
     *
     * @param Drupal.contextual.StateModel contextualModel
     *   The contextual links model that was added.
     * @param Backbone.Collection contextualCollection
     *    The collection of contextual link models.
     */
    lockNewContextualLinks: function (contextualModel, contextualCollection) {
      if (!this.get('isViewing')) {
        contextualModel.set('isLocked', true);
      }
    },

    /**
     * Automatically updates visibility of the view/edit mode toggle.
     */
    updateVisibility: function () {
      this.set('isVisible', this.get('contextualCount') > 0);
    }

  });

})(Drupal, Backbone);
;
/**
 * @file
 * A Backbone View that provides the aural view of the edit mode toggle.
 */

(function ($, Drupal, Backbone, _) {

  "use strict";

  /**
   * Renders the aural view of the edit mode toggle (i.e.screen reader support).
   */
  Drupal.contextualToolbar.AuralView = Backbone.View.extend({

    // Tracks whether the tabbing constraint announcement has been read once yet.
    announcedOnce: false,

    /*
     * {@inheritdoc}
     */
    initialize: function (options) {
      this.options = options;

      this.listenTo(this.model, 'change', this.render);
      this.listenTo(this.model, 'change:isViewing', this.manageTabbing);

      $(document).on('keyup', _.bind(this.onKeypress, this));
    },

    /**
     * {@inheritdoc}
     */
    render: function () {
      // Render the state.
      this.$el.find('button').attr('aria-pressed', !this.model.get('isViewing'));

      return this;
    },

    /**
     * Limits tabbing to the contextual links and edit mode toolbar tab.
     *
     * @param Drupal.contextualToolbar.StateModel model
     *   A Drupal.contextualToolbar.StateModel model.
     * @param bool isViewing
     *   The value of the isViewing attribute in the model.
     */
    manageTabbing: function () {
      var tabbingContext = this.model.get('tabbingContext');
      // Always release an existing tabbing context.
      if (tabbingContext) {
        tabbingContext.release();
        Drupal.announce(this.options.strings.tabbingReleased);
      }
      // Create a new tabbing context when edit mode is enabled.
      if (!this.model.get('isViewing')) {
        tabbingContext = Drupal.tabbingManager.constrain($('.contextual-toolbar-tab, .contextual'));
        this.model.set('tabbingContext', tabbingContext);
        this.announceTabbingConstraint();
        this.announcedOnce = true;
      }
    },

    /**
     * Announces the current tabbing constraint.
     */
    announceTabbingConstraint: function () {
      var strings = this.options.strings;
      Drupal.announce(Drupal.formatString(strings.tabbingConstrained, {
        '@contextualsCount': Drupal.formatPlural(Drupal.contextual.collection.length, '@count contextual link', '@count contextual links')
      }));
      Drupal.announce(strings.pressEsc);
    },

    /**
     * Responds to esc and tab key press events.
     *
     * @param jQuery.Event event
     */
    onKeypress: function (event) {
      // The first tab key press is tracked so that an annoucement about tabbing
      // constraints can be raised if edit mode is enabled when the page is
      // loaded.
      if (!this.announcedOnce && event.keyCode === 9 && !this.model.get('isViewing')) {
        this.announceTabbingConstraint();
        // Set announce to true so that this conditional block won't run again.
        this.announcedOnce = true;
      }
      // Respond to the ESC key. Exit out of edit mode.
      if (event.keyCode === 27) {
        this.model.set('isViewing', true);
      }
    }

  });

})(jQuery, Drupal, Backbone, _);
;
/**
 * @file
 * A Backbone View that provides the visual view of the edit mode toggle.
 */

(function (Drupal, Backbone) {

  "use strict";

  /**
   * Renders the visual view of the edit mode toggle. Listens to mouse & touch.
   *
   * Handles edit mode toggle interactions.
   */
  Drupal.contextualToolbar.VisualView = Backbone.View.extend({

    events: function () {
      // Prevents delay and simulated mouse events.
      var touchEndToClick = function (event) {
        event.preventDefault();
        event.target.click();
      };

      return {
        'click': function () {
          this.model.set('isViewing', !this.model.get('isViewing'));
        },
        'touchend': touchEndToClick
      };
    },

    /**
     * {@inheritdoc}
     */
    initialize: function () {
      this.listenTo(this.model, 'change', this.render);
      this.listenTo(this.model, 'change:isViewing', this.persist);
    },

    /**
     * {@inheritdoc}
     */
    render: function () {
      // Render the visibility.
      this.$el.toggleClass('hidden', !this.model.get('isVisible'));
      // Render the state.
      this.$el.find('button').toggleClass('active', !this.model.get('isViewing'));

      return this;
    },

    /**
     * Model change handler; persists the isViewing value to localStorage.
     *
     * isViewing === true is the default, so only stores in localStorage when
     * it's not the default value (i.e. false).
     *
     * @param Drupal.contextualToolbar.StateModel model
     *   A Drupal.contextualToolbar.StateModel model.
     * @param bool isViewing
     *   The value of the isViewing attribute in the model.
     */
    persist: function (model, isViewing) {
      if (!isViewing) {
        localStorage.setItem('Drupal.contextualToolbar.isViewing', 'false');
      }
      else {
        localStorage.removeItem('Drupal.contextualToolbar.isViewing');
      }
    }

  });

})(Drupal, Backbone);
;
/*
 * jQuery Foundation Joyride Plugin 2.0.3
 * http://foundation.zurb.com
 * Copyright 2012, ZURB
 * Free to use under the MIT license.
 * http://www.opensource.org/licenses/mit-license.php
*/

/*jslint unparam: true, browser: true, indent: 2 */

;(function ($, window, undefined) {
  'use strict';

  var defaults = {
      'version'              : '2.0.3',
      'tipLocation'          : 'bottom',  // 'top' or 'bottom' in relation to parent
      'nubPosition'          : 'auto',    // override on a per tooltip bases
      'scrollSpeed'          : 300,       // Page scrolling speed in milliseconds
      'timer'                : 0,         // 0 = no timer , all other numbers = timer in milliseconds
      'startTimerOnClick'    : true,      // true or false - true requires clicking the first button start the timer
      'startOffset'          : 0,         // the index of the tooltip you want to start on (index of the li)
      'nextButton'           : true,      // true or false to control whether a next button is used
      'tipAnimation'         : 'fade',    // 'pop' or 'fade' in each tip
      'pauseAfter'           : [],        // array of indexes where to pause the tour after
      'tipAnimationFadeSpeed': 300,       // when tipAnimation = 'fade' this is speed in milliseconds for the transition
      'cookieMonster'        : false,     // true or false to control whether cookies are used
      'cookieName'           : 'joyride', // Name the cookie you'll use
      'cookieDomain'         : false,     // Will this cookie be attached to a domain, ie. '.notableapp.com'
      'tipContainer'         : 'body',    // Where will the tip be attached
      'postRideCallback'     : $.noop,    // A method to call once the tour closes (canceled or complete)
      'postStepCallback'     : $.noop,    // A method to call after each step
      'template' : { // HTML segments for tip layout
        'link'    : '<a href="#close" class="joyride-close-tip">X</a>',
        'timer'   : '<div class="joyride-timer-indicator-wrap"><span class="joyride-timer-indicator"></span></div>',
        'tip'     : '<div class="joyride-tip-guide"><span class="joyride-nub"></span></div>',
        'wrapper' : '<div class="joyride-content-wrapper" role="dialog"></div>',
        'button'  : '<a href="#" class="joyride-next-tip"></a>'
      }
    },

    Modernizr = Modernizr || false,

    settings = {},

    methods = {

      init : function (opts) {
        return this.each(function () {

          if ($.isEmptyObject(settings)) {
            settings = $.extend(true, defaults, opts);

            // non configurable settings
            settings.document = window.document;
            settings.$document = $(settings.document);
            settings.$window = $(window);
            settings.$content_el = $(this);
            settings.body_offset = $(settings.tipContainer).position();
            settings.$tip_content = $('> li', settings.$content_el);
            settings.paused = false;
            settings.attempts = 0;

            settings.tipLocationPatterns = {
              top: ['bottom'],
              bottom: [], // bottom should not need to be repositioned
              left: ['right', 'top', 'bottom'],
              right: ['left', 'top', 'bottom']
            };

            // are we using jQuery 1.7+
            methods.jquery_check();

            // can we create cookies?
            if (!$.isFunction($.cookie)) {
              settings.cookieMonster = false;
            }

            // generate the tips and insert into dom.
            if (!settings.cookieMonster || !$.cookie(settings.cookieName)) {

              settings.$tip_content.each(function (index) {
                methods.create({$li : $(this), index : index});
              });

              // show first tip
              if (!settings.startTimerOnClick && settings.timer > 0) {
                methods.show('init');
                methods.startTimer();
              } else {
                methods.show('init');
              }

            }

            settings.$document.on('click.joyride', '.joyride-next-tip, .joyride-modal-bg', function (e) {
              e.preventDefault();

              if (settings.$li.next().length < 1) {
                methods.end();
              } else if (settings.timer > 0) {
                clearTimeout(settings.automate);
                methods.hide();
                methods.show();
                methods.startTimer();
              } else {
                methods.hide();
                methods.show();
              }

            });

            settings.$document.on('click.joyride', '.joyride-close-tip', function (e) {
              e.preventDefault();
              methods.end();
            });

            settings.$window.bind('resize.joyride', function (e) {
              if (methods.is_phone()) {
                methods.pos_phone();
              } else {
                methods.pos_default();
              }
            });
          } else {
            methods.restart();
          }

        });
      },

      // call this method when you want to resume the tour
      resume : function () {
        methods.set_li();
        methods.show();
      },

      tip_template : function (opts) {
        var $blank, content, $wrapper;

        opts.tip_class = opts.tip_class || '';

        $blank = $(settings.template.tip).addClass(opts.tip_class);
        content = $.trim($(opts.li).html()) +
          methods.button_text(opts.button_text) +
          settings.template.link +
          methods.timer_instance(opts.index);

        $wrapper = $(settings.template.wrapper);
        if (opts.li.attr('data-aria-labelledby')) {
          $wrapper.attr('aria-labelledby', opts.li.attr('data-aria-labelledby'))
        }
        if (opts.li.attr('data-aria-describedby')) {
          $wrapper.attr('aria-describedby', opts.li.attr('data-aria-describedby'))
        }
        $blank.append($wrapper);
        $blank.first().attr('data-index', opts.index);
        $('.joyride-content-wrapper', $blank).append(content);

        return $blank[0];
      },

      timer_instance : function (index) {
        var txt;

        if ((index === 0 && settings.startTimerOnClick && settings.timer > 0) || settings.timer === 0) {
          txt = '';
        } else {
          txt = methods.outerHTML($(settings.template.timer)[0]);
        }
        return txt;
      },

      button_text : function (txt) {
        if (settings.nextButton) {
          txt = $.trim(txt) || 'Next';
          txt = methods.outerHTML($(settings.template.button).append(txt)[0]);
        } else {
          txt = '';
        }
        return txt;
      },

      create : function (opts) {
        // backwards compatibility with data-text attribute
        var buttonText = opts.$li.attr('data-button') || opts.$li.attr('data-text'),
          tipClass = opts.$li.attr('class'),
          $tip_content = $(methods.tip_template({
            tip_class : tipClass,
            index : opts.index,
            button_text : buttonText,
            li : opts.$li
          }));

        $(settings.tipContainer).append($tip_content);
      },

      show : function (init) {
        var opts = {}, ii, opts_arr = [], opts_len = 0, p,
            $timer = null;

        // are we paused?
        if (settings.$li === undefined || ($.inArray(settings.$li.index(), settings.pauseAfter) === -1)) {

          // don't go to the next li if the tour was paused
          if (settings.paused) {
            settings.paused = false;
          } else {
            methods.set_li(init);
          }

          settings.attempts = 0;

          if (settings.$li.length && settings.$target.length > 0) {
            opts_arr = (settings.$li.data('options') || ':').split(';');
            opts_len = opts_arr.length;

            // parse options
            for (ii = opts_len - 1; ii >= 0; ii--) {
              p = opts_arr[ii].split(':');

              if (p.length === 2) {
                opts[$.trim(p[0])] = $.trim(p[1]);
              }
            }

            settings.tipSettings = $.extend({}, settings, opts);

            settings.tipSettings.tipLocationPattern = settings.tipLocationPatterns[settings.tipSettings.tipLocation];

            // scroll if not modal
            if (!/body/i.test(settings.$target.selector)) {
              methods.scroll_to();
            }

            if (methods.is_phone()) {
              methods.pos_phone(true);
            } else {
              methods.pos_default(true);
            }

            $timer = $('.joyride-timer-indicator', settings.$next_tip);

            if (/pop/i.test(settings.tipAnimation)) {

              $timer.outerWidth(0);

              if (settings.timer > 0) {

                settings.$next_tip.show();
                $timer.animate({
                  width: $('.joyride-timer-indicator-wrap', settings.$next_tip).outerWidth()
                }, settings.timer);

              } else {

                settings.$next_tip.show();

              }


            } else if (/fade/i.test(settings.tipAnimation)) {

              $timer.outerWidth(0);

              if (settings.timer > 0) {

                settings.$next_tip.fadeIn(settings.tipAnimationFadeSpeed);

                settings.$next_tip.show();
                $timer.animate({
                  width: $('.joyride-timer-indicator-wrap', settings.$next_tip).outerWidth()
                }, settings.timer);

              } else {

                settings.$next_tip.fadeIn(settings.tipAnimationFadeSpeed);

              }
            }

            settings.$current_tip = settings.$next_tip;
            $('.joyride-next-tip', settings.$current_tip).focus();
            methods.tabbable(settings.$current_tip);

          // skip non-existent targets
          } else if (settings.$li && settings.$target.length < 1) {

            methods.show();

          } else {

            methods.end();

          }
        } else {

          settings.paused = true;

        }

      },

      // detect phones with media queries if supported.
      is_phone : function () {
        if (Modernizr) {
          return Modernizr.mq('only screen and (max-width: 767px)');
        }

        return (settings.$window.width() < 767) ? true : false;
      },

      hide : function () {
        settings.postStepCallback(settings.$li.index(), settings.$current_tip);
        $('.joyride-modal-bg').hide();
        settings.$current_tip.hide();
      },

      set_li : function (init) {
        if (init) {
          settings.$li = settings.$tip_content.eq(settings.startOffset);
          methods.set_next_tip();
          settings.$current_tip = settings.$next_tip;
        } else {
          settings.$li = settings.$li.next();
          methods.set_next_tip();
        }

        methods.set_target();
      },

      set_next_tip : function () {
        settings.$next_tip = $('.joyride-tip-guide[data-index=' + settings.$li.index() + ']');
      },

      set_target : function () {
        var cl = settings.$li.attr('data-class'),
            id = settings.$li.attr('data-id'),
            $sel = function () {
              if (id) {
                return $(settings.document.getElementById(id));
              } else if (cl) {
                return $('.' + cl).first();
              } else {
                return $('body');
              }
            };

        settings.$target = $sel();
      },

      scroll_to : function () {
        var window_half, tipOffset;

        window_half = settings.$window.height() / 2;
        tipOffset = Math.ceil(settings.$target.offset().top - window_half + settings.$next_tip.outerHeight());

        $("html, body").stop().animate({
          scrollTop: tipOffset
        }, settings.scrollSpeed);
      },

      paused : function () {
        if (($.inArray((settings.$li.index() + 1), settings.pauseAfter) === -1)) {
          return true;
        }

        return false;
      },

      destroy : function () {
        settings.$document.off('.joyride');
        $(window).off('.joyride');
        $('.joyride-close-tip, .joyride-next-tip, .joyride-modal-bg').off('.joyride');
        $('.joyride-tip-guide, .joyride-modal-bg').remove();
        clearTimeout(settings.automate);
        settings = {};
      },

      restart : function () {
        methods.hide();
        settings.$li = undefined;
        methods.show('init');
      },

      pos_default : function (init) {
        var half_fold = Math.ceil(settings.$window.height() / 2),
            tip_position = settings.$next_tip.offset(),
            $nub = $('.joyride-nub', settings.$next_tip),
            nub_height = Math.ceil($nub.outerHeight() / 2),
            toggle = init || false;

        // tip must not be "display: none" to calculate position
        if (toggle) {
          settings.$next_tip.css('visibility', 'hidden');
          settings.$next_tip.show();
        }

        if (!/body/i.test(settings.$target.selector)) {

            if (methods.bottom()) {
              settings.$next_tip.css({
                top: (settings.$target.offset().top + nub_height + settings.$target.outerHeight()),
                left: settings.$target.offset().left});

              methods.nub_position($nub, settings.tipSettings.nubPosition, 'top');

            } else if (methods.top()) {

              settings.$next_tip.css({
                top: (settings.$target.offset().top - settings.$next_tip.outerHeight() - nub_height),
                left: settings.$target.offset().left});

              methods.nub_position($nub, settings.tipSettings.nubPosition, 'bottom');

            } else if (methods.right()) {

              settings.$next_tip.css({
                top: settings.$target.offset().top,
                left: (settings.$target.outerWidth() + settings.$target.offset().left)});

              methods.nub_position($nub, settings.tipSettings.nubPosition, 'left');

            } else if (methods.left()) {

              settings.$next_tip.css({
                top: settings.$target.offset().top,
                left: (settings.$target.offset().left - settings.$next_tip.outerWidth() - nub_height)});

              methods.nub_position($nub, settings.tipSettings.nubPosition, 'right');

            }

            if (!methods.visible(methods.corners(settings.$next_tip)) && settings.attempts < settings.tipSettings.tipLocationPattern.length) {

              $nub.removeClass('bottom')
                .removeClass('top')
                .removeClass('right')
                .removeClass('left');

              settings.tipSettings.tipLocation = settings.tipSettings.tipLocationPattern[settings.attempts];

              settings.attempts++;

              methods.pos_default(true);

            }

        } else if (settings.$li.length) {

          methods.pos_modal($nub);

        }

        if (toggle) {
          settings.$next_tip.hide();
          settings.$next_tip.css('visibility', 'visible');
        }

      },

      pos_phone : function (init) {
        var tip_height = settings.$next_tip.outerHeight(),
            tip_offset = settings.$next_tip.offset(),
            target_height = settings.$target.outerHeight(),
            $nub = $('.joyride-nub', settings.$next_tip),
            nub_height = Math.ceil($nub.outerHeight() / 2),
            toggle = init || false;

        $nub.removeClass('bottom')
          .removeClass('top')
          .removeClass('right')
          .removeClass('left');

        if (toggle) {
          settings.$next_tip.css('visibility', 'hidden');
          settings.$next_tip.show();
        }

        if (!/body/i.test(settings.$target.selector)) {

          if (methods.top()) {

              settings.$next_tip.offset({top: settings.$target.offset().top - tip_height - nub_height});
              $nub.addClass('bottom');

          } else {

            settings.$next_tip.offset({top: settings.$target.offset().top + target_height + nub_height});
            $nub.addClass('top');

          }

        } else if (settings.$li.length) {

          methods.pos_modal($nub);

        }

        if (toggle) {
          settings.$next_tip.hide();
          settings.$next_tip.css('visibility', 'visible');
        }
      },

      pos_modal : function ($nub) {
        methods.center();
        $nub.hide();

        if ($('.joyride-modal-bg').length < 1) {
          $('body').append('<div class="joyride-modal-bg">').show();
        }

        if (/pop/i.test(settings.tipAnimation)) {
          $('.joyride-modal-bg').show();
        } else {
          $('.joyride-modal-bg').fadeIn(settings.tipAnimationFadeSpeed);
        }
      },

      center : function () {
        var $w = settings.$window;

        settings.$next_tip.css({
          top : ((($w.height() - settings.$next_tip.outerHeight()) / 2) + $w.scrollTop()),
          left : ((($w.width() - settings.$next_tip.outerWidth()) / 2) + $w.scrollLeft())
        });

        return true;
      },

      bottom : function () {
        return /bottom/i.test(settings.tipSettings.tipLocation);
      },

      top : function () {
        return /top/i.test(settings.tipSettings.tipLocation);
      },

      right : function () {
        return /right/i.test(settings.tipSettings.tipLocation);
      },

      left : function () {
        return /left/i.test(settings.tipSettings.tipLocation);
      },

      corners : function (el) {
        var w = settings.$window,
            right = w.width() + w.scrollLeft(),
            bottom = w.width() + w.scrollTop();

        return [
          el.offset().top <= w.scrollTop(),
          right <= el.offset().left + el.outerWidth(),
          bottom <= el.offset().top + el.outerHeight(),
          w.scrollLeft() >= el.offset().left
        ];
      },

      visible : function (hidden_corners) {
        var i = hidden_corners.length;

        while (i--) {
          if (hidden_corners[i]) return false;
        }

        return true;
      },

      nub_position : function (nub, pos, def) {
        if (pos === 'auto') {
          nub.addClass(def);
        } else {
          nub.addClass(pos);
        }
      },

      startTimer : function () {
        if (settings.$li.length) {
          settings.automate = setTimeout(function () {
            methods.hide();
            methods.show();
            methods.startTimer();
          }, settings.timer);
        } else {
          clearTimeout(settings.automate);
        }
      },

      end : function () {
        if (settings.cookieMonster) {
          $.cookie(settings.cookieName, 'ridden', { expires: 365, domain: settings.cookieDomain });
        }

        if (settings.timer > 0) {
          clearTimeout(settings.automate);
        }

        $('.joyride-modal-bg').hide();
        settings.$current_tip.hide();
        settings.postStepCallback(settings.$li.index(), settings.$current_tip);
        settings.postRideCallback(settings.$li.index(), settings.$current_tip);
      },

      jquery_check : function () {
        // define on() and off() for older jQuery
        if (!$.isFunction($.fn.on)) {

          $.fn.on = function (types, sel, fn) {

            return this.delegate(sel, types, fn);

          };

          $.fn.off = function (types, sel, fn) {

            return this.undelegate(sel, types, fn);

          };

          return false;
        }

        return true;
      },

      outerHTML : function (el) {
        // support FireFox < 11
        return el.outerHTML || new XMLSerializer().serializeToString(el);
      },

      version : function () {
        return settings.version;
      },

      tabbable : function (el) {
        $(el).on('keydown', function( event ) {
          if (!event.isDefaultPrevented() && event.keyCode &&
              // Escape key.
              event.keyCode === 27 ) {
            event.preventDefault();
            methods.end();
            return;
          }

          // Prevent tabbing out of tour items.
          if ( event.keyCode !== 9 ) {
            return;
          }
          var tabbables = $(el).find(":tabbable"),
            first = tabbables.filter(":first"),
            last  = tabbables.filter(":last");
          if ( event.target === last[0] && !event.shiftKey ) {
            first.focus( 1 );
            event.preventDefault();
          } else if ( event.target === first[0] && event.shiftKey ) {
            last.focus( 1 );
            event.preventDefault();
          }
        });
      }

    };

  $.fn.joyride = function (method) {
    if (methods[method]) {
      return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
    } else if (typeof method === 'object' || !method) {
      return methods.init.apply(this, arguments);
    } else {
      $.error('Method ' +  method + ' does not exist on jQuery.joyride');
    }
  };

}(jQuery, this));
;
/**
 * @file
 * Attaches behaviors for the Tour module's toolbar tab.
 */

(function ($, Backbone, Drupal, document) {

  "use strict";

  var queryString = decodeURI(window.location.search);

  /**
   * Attaches the tour's toolbar tab behavior.
   *
   * It uses the query string for:
   * - tour: When ?tour=1 is present, the tour will start automatically
   *         after the page has loaded.
   * - tips: Pass ?tips=class in the url to filter the available tips to
   *         the subset which match the given class.
   *
   * Example:
   *   http://example.com/foo?tour=1&tips=bar
   */
  Drupal.behaviors.tour = {
    attach: function (context) {
      $('body').once('tour', function (index, element) {
        var model = new Drupal.tour.models.StateModel();
        new Drupal.tour.views.ToggleTourView({
          el: $(context).find('#toolbar-tab-tour'),
          model: model
        });

        model
          // Allow other scripts to respond to tour events.
          .on('change:isActive', function (model, isActive) {
            $(document).trigger((isActive) ? 'drupalTourStarted' : 'drupalTourStopped');
          })
          // Initialization: check whether a tour is available on the current page.
          .set('tour', $(context).find('ol#tour'));

        // Start the tour immediately if toggled via query string.
        if (/tour=?/i.test(queryString)) {
          model.set('isActive', true);
        }

      });
    }
  };

  Drupal.tour = Drupal.tour || { models: {}, views: {}};

  /**
   * Backbone Model for tours.
   */
  Drupal.tour.models.StateModel = Backbone.Model.extend({
    defaults: {
      // Indicates whether the Drupal root window has a tour.
      tour: [],
      // Indicates whether the tour is currently running.
      isActive: false,
      // Indicates which tour is the active one (necessary to cleanly stop).
      activeTour: []
    }
  });

  /**
   * Handles edit mode toggle interactions.
   */
  Drupal.tour.views.ToggleTourView = Backbone.View.extend({

    events: { 'click': 'onClick' },

    /**
     * Implements Backbone Views' initialize().
     */
    initialize: function () {
      this.listenTo(this.model, 'change:tour change:isActive', this.render);
      this.listenTo(this.model, 'change:isActive', this.toggleTour);
    },

    /**
     * Implements Backbone Views' render().
     */
    render: function () {
      // Render the visibility.
      this.$el.toggleClass('hidden', this._getTour().length === 0);
      // Render the state.
      var isActive = this.model.get('isActive');
      this.$el.find('button')
        .toggleClass('active', isActive)
        .prop('aria-pressed', isActive);
      return this;
    },

    /**
     * Model change handler; starts or stops the tour.
     */
    toggleTour: function () {
      if (this.model.get('isActive')) {
        var $tour = this._getTour();
        this._removeIrrelevantTourItems($tour, this._getDocument());
        var that = this;
        if ($tour.find('li').length) {
          $tour.joyride({
            postRideCallback: function () { that.model.set('isActive', false); },
            template : { // HTML segments for tip layout
              link : '<a href=\"#close\" class=\"joyride-close-tip\">&times;</a>',
              button : '<a href=\"#\" class=\"button button--primary joyride-next-tip\"></a>'
            }
          });
          this.model.set({ isActive: true, activeTour: $tour });
        }
      }
      else {
        this.model.get('activeTour').joyride('destroy');
        this.model.set({ isActive: false, activeTour: [] });
      }
    },

    /**
     * Toolbar tab click event handler; toggles isActive.
     */
    onClick: function (event) {
      this.model.set('isActive', !this.model.get('isActive'));
      event.preventDefault();
      event.stopPropagation();
    },

    /**
     * Gets the tour.
     *
     * @return jQuery
     *   A jQuery element pointing to a <ol> containing tour items.
     */
    _getTour: function () {
      return this.model.get('tour');
    },

    /**
     * Gets the relevant document as a jQuery element.
     *
     * @return jQuery
     *   A jQuery element pointing to the document within which a tour would be
     *   started given the current state.
     */
    _getDocument: function () {
      return $(document);
    },

    /**
     * Removes tour items for elements that don't have matching page elements or
     * are explicitly filtered out via the 'tips' query string.
     *
     * Example:
     *   http://example.com/foo?tips=bar
     *
     *   The above will filter out tips that do not have a matching page element or
     *   don't have the "bar" class.
     *
     * @param jQuery $tour
     *   A jQuery element pointing to a <ol> containing tour items.
     * @param jQuery $document
     *   A jQuery element pointing to the document within which the elements
     *   should be sought.
     *
     * @see _getDocument()
     */
    _removeIrrelevantTourItems: function ($tour, $document) {
      var removals = false;
      var tips = /tips=([^&]+)/.exec(queryString);
      $tour
        .find('li')
        .each(function () {
          var $this = $(this);
          var itemId = $this.attr('data-id');
          var itemClass = $this.attr('data-class');
          // If the query parameter 'tips' is set, remove all tips that don't
          // have the matching class.
          if (tips && !$(this).hasClass(tips[1])) {
            removals = true;
            $this.remove();
            return;
          }
          // Remove tip from the DOM if there is no corresponding page element.
          if ((!itemId && !itemClass) ||
            (itemId && $document.find('#' + itemId).length) ||
            (itemClass && $document.find('.' + itemClass).length)) {
            return;
          }
          removals = true;
          $this.remove();
        });

      // If there were removals, we'll have to do some clean-up.
      if (removals) {
        var total = $tour.find('li').length;
        if (!total) {
          this.model.set({ tour: [] });
        }

        $tour
          .find('li')
          // Rebuild the progress data.
          .each(function (index) {
            var progress = Drupal.t('!tour_item of !total', { '!tour_item': index + 1, '!total': total });
            $(this).find('.tour-progress').text(progress);
          })
          // Update the last item to have "End tour" as the button.
          .last()
          .attr('data-text', Drupal.t('End tour'));
      }
    }

  });

})(jQuery, Backbone, Drupal, document);
;
/**
 * Polyfill the behavior of window.matchMedia.
 *
 * @see http://dev.w3.org/csswg/cssom-view/#widl-Window-matchMedia-MediaQueryList-DOMString-query
 *
 * Test whether a CSS media type or media query applies. Register listeners
 * to MediaQueryList objects.
 *
 * Adapted from https://github.com/paulirish/matchMedia.js with the addition
 * of addListener and removeListener. The polyfill referenced above uses
 * polling to trigger registered listeners on matchMedia tests.
 * This polyfill triggers tests on window resize and orientationchange.
 */

window.matchMedia = window.matchMedia || (function (doc, window, Drupal) {

  "use strict";

  var docElem = doc.documentElement;
  var refNode = docElem.firstElementChild || docElem.firstChild;
  // fakeBody required for <FF4 when executed in <head>.
  var fakeBody = doc.createElement("body");
  var div = doc.createElement("div");

  div.id = "mq-test-1";
  div.style.cssText = "position:absolute;top:-100em";
  fakeBody.style.background = "none";
  fakeBody.appendChild(div);

  /**
   * A replacement for the native MediaQueryList object.
   *
   * @param {String} q
   *   A media query e.g. "screen" or "screen and (min-width: 28em)".
   */
  function MediaQueryList(q) {
    this.media = q;
    this.matches = false;
    this.check.call(this);
  }

  /**
   * Polyfill the addListener and removeListener methods.
   */
  MediaQueryList.prototype = {
    listeners: [],

    /**
     * Perform the media query application check.
     */
    check: function () {
      var isApplied;
      div.innerHTML = "&shy;<style media=\"" + this.media + "\"> #mq-test-1 {width: 42px;}</style>";
      docElem.insertBefore(fakeBody, refNode);
      isApplied = div.offsetWidth === 42;
      docElem.removeChild(fakeBody);
      this.matches = isApplied;
    },

    /**
     * Polyfill the addListener method of the MediaQueryList object.
     *
     * @param {Function} callback
     *   The callback to be invoked when the media query is applicable.
     *
     * @return {Object MediaQueryList}
     *   A MediaQueryList object that indicates whether the registered media
     *   query applies. The matches property is true when the media query
     *   applies and false when not. The original media query is referenced in
     *   the media property.
     */
    addListener: function (callback) {
      var handler = (function (mql, debounced) {
        return function () {
          // Only execute the callback if the state has changed.
          var oldstate = mql.matches;
          mql.check();
          if (oldstate !== mql.matches) {
            debounced.call(mql, mql);
          }
        };
      }(this, Drupal.debounce(callback, 250)));
      this.listeners.push({
        'callback': callback,
        'handler': handler
      });

      // Associate the handler to the resize and orientationchange events.
      if ('addEventListener' in window) {
        window.addEventListener('resize', handler);
        window.addEventListener('orientationchange', handler);
      }
      else if ('attachEvent' in window) {
        window.attachEvent('onresize', handler);
        window.attachEvent('onorientationchange', handler);
      }
    },

    /**
     * Polyfill the removeListener method of the MediaQueryList object.
     *
     * @param {Function} callback
     *   The callback to be removed from the set of listeners.
     */
    removeListener: function (callback) {
      for (var i = 0, listeners = this.listeners; i < listeners.length; i++) {
        if (listeners[i].callback === callback) {
          // Disassociate the handler to the resize and orientationchange events.
          if ('removeEventListener' in window) {
            window.removeEventListener('resize', listeners[i].handler);
            window.removeEventListener('orientationchange', listeners[i].handler);
          }
          else if ('detachEvent' in window) {
            window.detachEvent('onresize', listeners[i].handler);
            window.detachEvent('onorientationchange', listeners[i].handler);
          }
          listeners.splice(i, 1);
        }
      }
    }
  };

  /**
   * Return a MediaQueryList.
   *
   * @param {String} q
   *   A media query e.g. "screen" or "screen and (min-width: 28em)". The media
   *   query is checked for applicability before the object is returned.
   */
  return function (q) {
    // Build a new MediaQueryList object with the result of the check.
    return new MediaQueryList(q);
  };
}(document, window, Drupal));
;
/**
 * Builds a nested accordion widget.
 *
 * Invoke on an HTML list element with the jQuery plugin pattern.
 * - For example, $('.menu').drupalToolbarMenu();
 */

(function ($, Drupal, drupalSettings) {

  "use strict";

  /**
   * Store the open menu tray.
   */
  var activeItem = Drupal.url(drupalSettings.path.currentPath);

  $.fn.drupalToolbarMenu = function () {

    var ui = {
      'handleOpen': Drupal.t('Extend'),
      'handleClose': Drupal.t('Collapse')
    };
    /**
     * Handle clicks from the disclosure button on an item with sub-items.
     *
     * @param {Object} event
     *   A jQuery Event object.
     */
    function toggleClickHandler(event) {
      var $toggle = $(event.target);
      var $item = $toggle.closest('li');
      // Toggle the list item.
      toggleList($item);
      // Close open sibling menus.
      var $openItems = $item.siblings().filter('.open');
      toggleList($openItems, false);
    }
    /**
     * Toggle the open/close state of a list is a menu.
     *
     * @param {jQuery} $item
     *   The li item to be toggled.
     *
     * @param {Boolean} switcher
     *   A flag that forces toggleClass to add or a remove a class, rather than
     *   simply toggling its presence.
     */
    function toggleList($item, switcher) {
      var $toggle = $item.children('.toolbar-box').children('.toolbar-handle');
      switcher = (typeof switcher !== 'undefined') ? switcher : !$item.hasClass('open');
      // Toggle the item open state.
      $item.toggleClass('open', switcher);
      // Twist the toggle.
      $toggle.toggleClass('open', switcher);
      // Adjust the toggle text.
      $toggle
        .find('.action')
        // Expand Structure, Collapse Structure
        .text((switcher) ? ui.handleClose : ui.handleOpen);
    }
    /**
     * Add markup to the menu elements.
     *
     * Items with sub-elements have a list toggle attached to them. Menu item
     * links and the corresponding list toggle are wrapped with in a div
     * classed with .toolbar-box. The .toolbar-box div provides a positioning
     * context for the item list toggle.
     *
     * @param {jQuery} $menu
     *   The root of the menu to be initialized.
     */
    function initItems($menu) {
      var options = {
        'class': 'toolbar-icon toolbar-handle',
        'action': ui.handleOpen,
        'text': ''
      };
      // Initialize items and their links.
      $menu.find('li > a').wrap('<div class="toolbar-box">');
      // Add a handle to each list item if it has a menu.
      $menu.find('li').each(function (index, element) {
        var $item = $(element);
        if ($item.children('ul.menu').length) {
          var $box = $item.children('.toolbar-box');
          options.text = Drupal.t('@label', {'@label': $box.find('a').text()});
          $item.children('.toolbar-box')
            .append(Drupal.theme('toolbarMenuItemToggle', options));
        }
      });
    }
    /**
     * Adds a level class to each list based on its depth in the menu.
     *
     * This function is called recursively on each sub level of lists elements
     * until the depth of the menu is exhausted.
     *
     * @param {jQuery} $lists
     *   A jQuery object of ul elements.
     *
     * @param {Integer} level
     *   The current level number to be assigned to the list elements.
     */
    function markListLevels($lists, level) {
      level = (!level) ? 1 : level;
      var $lis = $lists.children('li').addClass('level-' + level);
      $lists = $lis.children('ul');
      if ($lists.length) {
        markListLevels($lists, level + 1);
      }
    }
    /**
     * On page load, open the active menu item.
     *
     * Marks the trail of the active link in the menu back to the root of the
     * menu with .active-trail.
     *
     * @param {jQuery} $menu
     *   The root of the menu.
     */
    function openActiveItem($menu) {
      var pathItem = $menu.find('a[href="' + location.pathname + '"]');
      if (pathItem.length && !activeItem) {
        activeItem = location.pathname;
      }
      if (activeItem) {
        var $activeItem = $menu.find('a[href="' + activeItem + '"]').addClass('active');
        var $activeTrail = $activeItem.parentsUntil('.root', 'li').addClass('active-trail');
        toggleList($activeTrail, true);
      }
    }
    // Bind event handlers.
    $(document)
      .on('click.toolbar', '.toolbar-handle', toggleClickHandler);
    // Return the jQuery object.
    return this.each(function (selector) {
      var $menu = $(this).once('toolbar-menu');
      if ($menu.length) {
        $menu.addClass('root');
        initItems($menu);
        markListLevels($menu);
        // Restore previous and active states.
        openActiveItem($menu);
      }
    });
  };

  /**
   * A toggle is an interactive element often bound to a click handler.
   *
   * @return {String}
   *   A string representing a DOM fragment.
   */
  Drupal.theme.toolbarMenuItemToggle = function (options) {
    return '<button class="' + options['class'] + '"><span class="action">' + options.action + '</span><span class="label">' + options.text + '</span></button>';
  };

}(jQuery, Drupal, drupalSettings));
;
/**
 * @file toolbar.js
 *
 * Defines the behavior of the Drupal administration toolbar.
 */
(function ($, Drupal, drupalSettings) {

  "use strict";

  // Merge run-time settings with the defaults.
  var options = $.extend(
    {
      breakpoints: {
        'module.toolbar.narrow': '',
        'module.toolbar.standard': '',
        'module.toolbar.wide': ''
      }
    },
    drupalSettings.toolbar,
    // Merge strings on top of drupalSettings so that they are not mutable.
    {
      strings: {
        horizontal: Drupal.t('Horizontal orientation'),
        vertical: Drupal.t('Vertical orientation')
      }
    }
  );

  /**
   * Registers tabs with the toolbar.
   *
   * The Drupal toolbar allows modules to register top-level tabs. These may point
   * directly to a resource or toggle the visibility of a tray.
   *
   * Modules register tabs with hook_toolbar().
   */
  Drupal.behaviors.toolbar = {

    attach: function (context) {
      // Verify that the user agent understands media queries. Complex admin
      // toolbar layouts require media query support.
      if (!window.matchMedia('only screen').matches) {
        return;
      }
      // Process the administrative toolbar.
      $(context).find('#toolbar-administration').once('toolbar', function () {

        // Establish the toolbar models and views.
        var model = Drupal.toolbar.models.toolbarModel = new Drupal.toolbar.ToolbarModel({
          locked: JSON.parse(localStorage.getItem('Drupal.toolbar.trayVerticalLocked')) || false,
          activeTab: document.getElementById(JSON.parse(localStorage.getItem('Drupal.toolbar.activeTabID')))
        });
        Drupal.toolbar.views.toolbarVisualView = new Drupal.toolbar.ToolbarVisualView({
          el: this,
          model: model,
          strings: options.strings
        });
        Drupal.toolbar.views.toolbarAuralView = new Drupal.toolbar.ToolbarAuralView({
          el: this,
          model: model,
          strings: options.strings
        });
        Drupal.toolbar.views.bodyVisualView = new Drupal.toolbar.BodyVisualView({
          el: this,
          model: model
        });

        // Render collapsible menus.
        var menuModel = Drupal.toolbar.models.menuModel = new Drupal.toolbar.MenuModel();
        Drupal.toolbar.views.menuVisualView = new Drupal.toolbar.MenuVisualView({
          el: $(this).find('.toolbar-menu-administration').get(0),
          model: menuModel,
          strings: options.strings
        });

        // Handle the resolution of Drupal.toolbar.setSubtrees.
        // This is handled with a deferred so that the function may be invoked
        // asynchronously.
        Drupal.toolbar.setSubtrees.done(function (subtrees) {
          menuModel.set('subtrees', subtrees);
          localStorage.setItem('Drupal.toolbar.subtrees', JSON.stringify(subtrees));
          // Indicate on the toolbarModel that subtrees are now loaded.
          model.set('areSubtreesLoaded', true);
        });

        // Attach a listener to the configured media query breakpoints.
        for (var label in options.breakpoints) {
          if (options.breakpoints.hasOwnProperty(label)) {
            var mq = options.breakpoints[label];
            var mql = Drupal.toolbar.mql[label] = window.matchMedia(mq);
            // Curry the model and the label of the media query breakpoint to the
            // mediaQueryChangeHandler function.
            mql.addListener(Drupal.toolbar.mediaQueryChangeHandler.bind(null, model, label));
            // Fire the mediaQueryChangeHandler for each configured breakpoint
            // so that they process once.
            Drupal.toolbar.mediaQueryChangeHandler.call(null, model, label, mql);
          }
        }

        // Trigger an initial attempt to load menu subitems. This first attempt
        // is made after the media query handlers have had an opportunity to
        // process. The toolbar starts in the vertical orientation by default,
        // unless the viewport is wide enough to accommodate a horizontal
        // orientation. Thus we give the Toolbar a chance to determine if it
        // should be set to horizontal orientation before attempting to load menu
        // subtrees.
        Drupal.toolbar.views.toolbarVisualView.loadSubtrees();

        $(document)
          // Update the model when the viewport offset changes.
          .on('drupalViewportOffsetChange.toolbar', function (event, offsets) {
            model.set('offsets', offsets);
          });

        // Broadcast model changes to other modules.
        model
          .on('change:orientation', function (model, orientation) {
            $(document).trigger('drupalToolbarOrientationChange', orientation);
          })
          .on('change:activeTab', function (model, tab) {
            $(document).trigger('drupalToolbarTabChange', tab);
          })
          .on('change:activeTray', function (model, tray) {
            $(document).trigger('drupalToolbarTrayChange', tray);
          });
      });
    }
  };

  /**
   * Toolbar methods of Backbone objects.
   */
  Drupal.toolbar = {

    // A hash of View instances.
    views: {},

    // A hash of Model instances.
    models: {},

    // A hash of MediaQueryList objects tracked by the toolbar.
    mql: {},

    /**
     * Accepts a list of subtree menu elements.
     *
     * A deferred object that is resolved by an inlined JavaScript callback.
     *
     * JSONP callback.
     * @see toolbar_subtrees_jsonp().
     */
    setSubtrees: new $.Deferred(),

    /**
     * Respond to configured narrow media query changes.
     */
    mediaQueryChangeHandler: function (model, label, mql) {
      switch (label) {
        case 'module.toolbar.narrow':
          model.set({
            'isOriented': mql.matches,
            'isTrayToggleVisible': false
          });
          // If the toolbar doesn't have an explicit orientation yet, or if the
          // narrow media query doesn't match then set the orientation to
          // vertical.
          if (!mql.matches || !model.get('orientation')) {
            model.set({'orientation': 'vertical'}, {validate: true});
          }
          break;
        case 'module.toolbar.standard':
          model.set({
            'isFixed': mql.matches
          });
          break;
        case 'module.toolbar.wide':
          model.set({
            'orientation': ((mql.matches) ? 'horizontal' : 'vertical')
          }, {validate: true});
          // The tray orientation toggle visibility does not need to be validated.
          model.set({
            'isTrayToggleVisible': mql.matches
          });
          break;
        default:
          break;
      }
    }
  };

  /**
   * A toggle is an interactive element often bound to a click handler.
   *
   * @return {String}
   *   A string representing a DOM fragment.
   */
  Drupal.theme.toolbarOrientationToggle = function () {
    return '<div class="toolbar-toggle-orientation"><div class="toolbar-lining">' +
      '<button class="toolbar-icon" type="button"></button>' +
      '</div></div>';
  };

}(jQuery, Drupal, drupalSettings));
;
/**
 * @file
 * A Backbone Model for collapsible menus.
 */

(function (Backbone, Drupal) {

  "use strict";

  /**
   * Backbone Model for collapsible menus.
   */
  Drupal.toolbar.MenuModel = Backbone.Model.extend({
    defaults: {
      subtrees: {}
    }
  });

}(Backbone, Drupal));
;
/**
 * @file
 * A Backbone Model for the toolbar.
 */

(function (Backbone, Drupal) {

  "use strict";

  /**
   * Backbone model for the toolbar.
   */
  Drupal.toolbar.ToolbarModel = Backbone.Model.extend({
    defaults: {
      // The active toolbar tab. All other tabs should be inactive under
      // normal circumstances. It will remain active across page loads. The
      // active item is stored as an ID selector e.g. '#toolbar-item--1'.
      activeTab: null,
      // Represents whether a tray is open or not. Stored as an ID selector e.g.
      // '#toolbar-item--1-tray'.
      activeTray: null,
      // Indicates whether the toolbar is displayed in an oriented fashion,
      // either horizontal or vertical.
      isOriented: false,
      // Indicates whether the toolbar is positioned absolute (false) or fixed
      // (true).
      isFixed: false,
      // Menu subtrees are loaded through an AJAX request only when the Toolbar
      // is set to a vertical orientation.
      areSubtreesLoaded: false,
      // If the viewport overflow becomes constrained, isFixed must be true so
      // that elements in the trays aren't lost off-screen and impossible to
      // get to.
      isViewportOverflowConstrained: false,
      // The orientation of the active tray.
      orientation: 'vertical',
      // A tray is locked if a user toggled it to vertical. Otherwise a tray
      // will switch between vertical and horizontal orientation based on the
      // configured breakpoints. The locked state will be maintained across page
      // loads.
      locked: false,
      // Indicates whether the tray orientation toggle is visible.
      isTrayToggleVisible: false,
      // The height of the toolbar.
      height: null,
      // The current viewport offsets determined by Drupal.displace(). The
      // offsets suggest how a module might position is components relative to
      // the viewport.
      offsets: {
        top: 0,
        right: 0,
        bottom: 0,
        left: 0
      }
    },

    /**
     * {@inheritdoc}
     */
    validate: function (attributes, options) {
      // Prevent the orientation being set to horizontal if it is locked, unless
      // override has not been passed as an option.
      if (attributes.orientation === 'horizontal' && this.get('locked') && !options.override) {
        return Drupal.t('The toolbar cannot be set to a horizontal orientation when it is locked.');
      }
    }
  });

}(Backbone, Drupal));
;
/**
 * @file
 * A Backbone view for the body element.
 */

(function ($, Drupal, Backbone) {

  "use strict";

  /**
   * Adjusts the body element with the toolbar position and dimension changes.
   */
  Drupal.toolbar.BodyVisualView = Backbone.View.extend({

    /**
     * {@inheritdoc}
     */
    initialize: function () {
      this.listenTo(this.model, 'change:orientation change:offsets change:activeTray change:isOriented change:isFixed change:isViewportOverflowConstrained', this.render);
    },

    /**
     * {@inheritdoc}
     */
    render: function () {
      var $body = $('body');
      var orientation = this.model.get('orientation');
      var isOriented = this.model.get('isOriented');
      var isViewportOverflowConstrained = this.model.get('isViewportOverflowConstrained');

      $body
        // We are using JavaScript to control media-query handling for two
        // reasons: (1) Using JavaScript let's us leverage the breakpoint
        // configurations and (2) the CSS is really complex if we try to hide
        // some styling from browsers that don't understand CSS media queries.
        // If we drive the CSS from classes added through JavaScript,
        // then the CSS becomes simpler and more robust.
        .toggleClass('toolbar-vertical', (orientation === 'vertical'))
        .toggleClass('toolbar-horizontal', (isOriented && orientation === 'horizontal'))
        // When the toolbar is fixed, it will not scroll with page scrolling.
        .toggleClass('toolbar-fixed', (isViewportOverflowConstrained || this.model.get('isFixed')))
        // Toggle the toolbar-tray-open class on the body element. The class is
        // applied when a toolbar tray is active. Padding might be applied to
        // the body element to prevent the tray from overlapping content.
        .toggleClass('toolbar-tray-open', !!this.model.get('activeTray'))
        // Apply padding to the top of the body to offset the placement of the
        // toolbar bar element.
        .css('padding-top', this.model.get('offsets').top);
    }
  });

}(jQuery, Drupal, Backbone));
;
/**
 * @file
 * A Backbone view for the collapsible menus.
 */

(function ($, Backbone, Drupal) {

  "use strict";

  /**
   * Backbone View for collapsible menus.
   */
  Drupal.toolbar.MenuVisualView = Backbone.View.extend({
    /**
     * {@inheritdoc}
     */
    initialize: function () {
      this.listenTo(this.model, 'change:subtrees', this.render);
    },

    /**
     * {@inheritdoc}
     */
    render: function () {
      var subtrees = this.model.get('subtrees');
      // Add subtrees.
      for (var id in subtrees) {
        if (subtrees.hasOwnProperty(id)) {
          this.$el
            .find('#toolbar-link-' + id)
            .once('toolbar-subtrees')
            .after(subtrees[id]);
        }
      }
      // Render the main menu as a nested, collapsible accordion.
      if ('drupalToolbarMenu' in $.fn) {
        this.$el
          .children('.menu')
          .drupalToolbarMenu();
      }
    }
  });

}(jQuery, Backbone, Drupal));
;
/**
 * @file
 * A Backbone view for the aural feedback of the toolbar.
 */

(function (Backbone, Drupal) {

  "use strict";

  /**
   * Backbone view for the aural feedback of the toolbar.
   */
  Drupal.toolbar.ToolbarAuralView = Backbone.View.extend({

    /**
     * {@inheritdoc}
     */
    initialize: function (options) {
      this.strings = options.strings;

      this.listenTo(this.model, 'change:orientation', this.onOrientationChange);
      this.listenTo(this.model, 'change:activeTray', this.onActiveTrayChange);
    },

    /**
     * Announces an orientation change.
     *
     * @param Drupal.Toolbar.ToolbarModel model
     * @param String orientation
     *   The new value of the orientation attribute in the model.
     */
    onOrientationChange: function (model, orientation) {
      Drupal.announce(Drupal.t('Tray orientation changed to @orientation.', {
        '@orientation': orientation
      }));
    },

    /**
     * Announces a changed active tray.
     *
     * @param Drupal.Toolbar.ToolbarModel model
     * @param Element orientation
     *   The new value of the tray attribute in the model.
     */
    onActiveTrayChange: function (model, tray) {
      var relevantTray = (tray === null) ? model.previous('activeTray') : tray;
      var trayName = relevantTray.querySelector('.toolbar-tray-name').textContent;
      var text;
      if (tray === null) {
        text = Drupal.t('Tray "@tray" closed.', { '@tray': trayName });
      }
      else {
        text = Drupal.t('Tray "@tray" opened.', { '@tray': trayName });
      }
      Drupal.announce(text);
    }
  });

}(Backbone, Drupal));
;
/**
 * @file
 * A Backbone view for the toolbar element.
 */

(function ($, Drupal, drupalSettings, Backbone) {

  "use strict";

  /**
   * Backbone view for the toolbar element.
   */
  Drupal.toolbar.ToolbarVisualView = Backbone.View.extend({

    events: {
      'click .toolbar-bar .toolbar-tab': 'onTabClick',
      'click .toolbar-toggle-orientation button': 'onOrientationToggleClick'
    },

    /**
     * {@inheritdoc}
     */
    initialize: function (options) {
      this.strings = options.strings;

      this.listenTo(this.model, 'change:activeTab change:orientation change:isOriented change:isTrayToggleVisible', this.render);
      this.listenTo(this.model, 'change:mqMatches', this.onMediaQueryChange);
      this.listenTo(this.model, 'change:offsets', this.adjustPlacement);

      // Add the tray orientation toggles.
      this.$el
        .find('.toolbar-tray .toolbar-lining')
        .append(Drupal.theme('toolbarOrientationToggle'));

      // Trigger an activeTab change so that listening scripts can respond on
      // page load. This will call render.
      this.model.trigger('change:activeTab');
    },

    /**
     * {@inheritdoc}
     */
    render: function () {
      this.updateTabs();
      this.updateTrayOrientation();
      this.updateBarAttributes();
      // Load the subtrees if the orientation of the toolbar is changed to
      // vertical. This condition responds to the case that the toolbar switches
      // from horizontal to vertical orientation. The toolbar starts in a
      // vertical orientation by default and then switches to horizontal during
      // initialization if the media query conditions are met. Simply checking
      // that the orientation is vertical here would result in the subtrees
      // always being loaded, even when the toolbar initialization ultimately
      // results in a horizontal orientation.
      //
      // @see Drupal.behaviors.toolbar.attach() where admin menu subtrees
      // loading is invoked during initialization after media query conditions
      // have been processed.
      if (this.model.changed.orientation === 'vertical' || this.model.changed.activeTab) {
        this.loadSubtrees();
      }
      // Trigger a recalculation of viewport displacing elements. Use setTimeout
      // to ensure this recalculation happens after changes to visual elements
      // have processed.
      window.setTimeout(function () {
        Drupal.displace(true);
      }, 0);
      return this;
    },

    /**
     * Responds to a toolbar tab click.
     *
     * @param jQuery.Event event
     */
    onTabClick: function (event) {
      // If this tab has a tray associated with it, it is considered an
      // activatable tab.
      if (event.target.hasAttribute('data-toolbar-tray')) {
        var activeTab = this.model.get('activeTab');
        var clickedTab = event.target;

        // Set the event target as the active item if it is not already.
        this.model.set('activeTab', (!activeTab || clickedTab !== activeTab) ? clickedTab : null);

        event.preventDefault();
        event.stopPropagation();
      }
    },

    /**
     * Toggles the orientation of a toolbar tray.
     *
     * @param jQuery.Event event
     */
    onOrientationToggleClick: function (event) {
      var orientation = this.model.get('orientation');
      // Determine the toggle-to orientation.
      var antiOrientation = (orientation === 'vertical') ? 'horizontal' : 'vertical';
      var locked = (antiOrientation === 'vertical') ? true : false;
      // Remember the locked state.
      if (locked) {
        localStorage.setItem('Drupal.toolbar.trayVerticalLocked', 'true');
      }
      else {
        localStorage.removeItem('Drupal.toolbar.trayVerticalLocked');
      }
      // Update the model.
      this.model.set({
        locked: locked,
        orientation: antiOrientation
      }, {
        validate: true,
        override: true
      });

      event.preventDefault();
      event.stopPropagation();
    },

    /**
     * Updates the display of the tabs: toggles a tab and the associated tray.
     */
    updateTabs: function () {
      var $tab = $(this.model.get('activeTab'));
      // Deactivate the previous tab.
      $(this.model.previous('activeTab'))
        .removeClass('active')
        .prop('aria-pressed', false);
      // Deactivate the previous tray.
      $(this.model.previous('activeTray'))
        .removeClass('active');

      // Activate the selected tab.
      if ($tab.length > 0) {
        $tab
          .addClass('active')
          // Mark the tab as pressed.
          .prop('aria-pressed', true);
        var name = $tab.attr('data-toolbar-tray');
        // Store the active tab name or remove the setting.
        var id = $tab.get(0).id;
        if (id) {
          localStorage.setItem('Drupal.toolbar.activeTabID', JSON.stringify(id));
        }
        // Activate the associated tray.
        var $tray = this.$el.find('[data-toolbar-tray="' + name + '"].toolbar-tray');
        if ($tray.length) {
          $tray.addClass('active');
          this.model.set('activeTray', $tray.get(0));
        }
        else {
          // There is no active tray.
          this.model.set('activeTray', null);
        }
      }
      else {
        // There is no active tray.
        this.model.set('activeTray', null);
        localStorage.removeItem('Drupal.toolbar.activeTabID');
      }
    },

    /**
     * Update the attributes of the toolbar bar element.
     */
    updateBarAttributes: function () {
      var isOriented = this.model.get('isOriented');
      if (isOriented) {
        this.$el.find('.toolbar-bar').attr('data-offset-top', '');
      }
      else {
        this.$el.find('.toolbar-bar').removeAttr('data-offset-top');
      }
      // Toggle between a basic vertical view and a more sophisticated
      // horizontal and vertical display of the toolbar bar and trays.
      this.$el.toggleClass('toolbar-oriented', isOriented);
    },

    /**
     * Updates the orientation of the active tray if necessary.
     */
    updateTrayOrientation: function () {
      var orientation = this.model.get('orientation');
      // The antiOrientation is used to render the view of action buttons like
      // the tray orientation toggle.
      var antiOrientation = (orientation === 'vertical') ? 'horizontal' : 'vertical';
      // Update the orientation of the trays.
      var $trays = this.$el.find('.toolbar-tray')
        .removeClass('toolbar-tray-horizontal toolbar-tray-vertical')
        .addClass('toolbar-tray-' + orientation);

      // Update the tray orientation toggle button.
      var iconClass = 'toolbar-icon-toggle-' + orientation;
      var iconAntiClass = 'toolbar-icon-toggle-' + antiOrientation;
      var $orientationToggle = this.$el.find('.toolbar-toggle-orientation')
        .toggle(this.model.get('isTrayToggleVisible'));
      $orientationToggle.find('button')
        .val(antiOrientation)
        .attr('title', this.strings[antiOrientation])
        .text(this.strings[antiOrientation])
        .removeClass(iconClass)
        .addClass(iconAntiClass);

      // Update data offset attributes for the trays.
      var dir = document.documentElement.dir;
      var edge = (dir === 'rtl') ? 'right' : 'left';
      // Remove data-offset attributes from the trays so they can be refreshed.
      $trays.removeAttr('data-offset-left data-offset-right data-offset-top');
      // If an active vertical tray exists, mark it as an offset element.
      $trays.filter('.toolbar-tray-vertical.active').attr('data-offset-' + edge, '');
      // If an active horizontal tray exists, mark it as an offset element.
      $trays.filter('.toolbar-tray-horizontal.active').attr('data-offset-top', '');
    },

    /**
     * Sets the tops of the trays so that they align with the bottom of the bar.
     */
    adjustPlacement: function () {
      var $trays = this.$el.find('.toolbar-tray');
      if (!this.model.get('isOriented')) {
        $trays.css('padding-top', 0);
        $trays.removeClass('toolbar-tray-horizontal').addClass('toolbar-tray-vertical');
      }
      else {
        // The toolbar container is invisible. Its placement is used to
        // determine the container for the trays.
        $trays.css('padding-top', this.$el.find('.toolbar-bar').outerHeight());
      }
    },

    /**
     * Calls the endpoint URI that will return rendered subtrees with JSONP.
     *
     * The rendered admin menu subtrees HTML is cached on the client in
     * localStorage until the cache of the admin menu subtrees on the server-
     * side is invalidated. The subtreesHash is stored in localStorage as well
     * and compared to the subtreesHash in drupalSettings to determine when the
     * admin menu subtrees cache has been invalidated.
     */
    loadSubtrees: function () {
      var $activeTab = $(this.model.get('activeTab'));
      var orientation = this.model.get('orientation');
      // Only load and render the admin menu subtrees if:
      //   (1) They have not been loaded yet.
      //   (2) The active tab is the administration menu tab, indicated by the
      //       presence of the data-drupal-subtrees attribute.
      //   (3) The orientation of the tray is vertical.
      if (!this.model.get('areSubtreesLoaded') && $activeTab.data('drupal-subtrees') !== undefined && orientation === 'vertical') {
        var subtreesHash = drupalSettings.toolbar.subtreesHash;
        var langcode = drupalSettings.toolbar.langcode;
        var endpoint = Drupal.url('toolbar/subtrees/' + subtreesHash + '/' + langcode);
        var cachedSubtreesHash = localStorage.getItem('Drupal.toolbar.subtreesHash');
        var cachedSubtrees = JSON.parse(localStorage.getItem('Drupal.toolbar.subtrees'));
        var isVertical = this.model.get('orientation') === 'vertical';
        // If we have the subtrees in localStorage and the subtree hash has not
        // changed, then use the cached data.
        if (isVertical && subtreesHash === cachedSubtreesHash && cachedSubtrees) {
          Drupal.toolbar.setSubtrees.resolve(cachedSubtrees);
        }
        // Only make the call to get the subtrees if the orientation of the
        // toolbar is vertical.
        else if (isVertical) {
          // Remove the cached menu information.
          localStorage.removeItem('Drupal.toolbar.subtreesHash');
          localStorage.removeItem('Drupal.toolbar.subtrees');
          // The response from the server will call the resolve method of the
          // Drupal.toolbar.setSubtrees Promise.
          $.ajax(endpoint);
          // Cache the hash for the subtrees locally.
          localStorage.setItem('Drupal.toolbar.subtreesHash', subtreesHash);
        }
      }
    }
  });

}(jQuery, Drupal, drupalSettings, Backbone));
;
/**
 * @file
 * Attaches behaviors for Drupal's active link marking.
 */

(function (Drupal, drupalSettings) {

  "use strict";

  /**
   * Append active class.
   *
   * The link is only active if its path corresponds to the current path, the
   * language of the linked path is equal to the current language, and if the
   * query parameters of the link equal those of the current request, since the
   * same request with different query parameters may yield a different page
   * (e.g. pagers, exposed View filters).
   *
   * Does not discriminate based on element type, so allows you to set the active
   * class on any element: a, li…
   */
  Drupal.behaviors.activeLinks = {
    attach: function (context) {
      // Start by finding all potentially active links.
      var path = drupalSettings.path;
      var queryString = JSON.stringify(path.currentQuery);
      var querySelector = path.currentQuery ? "[data-drupal-link-query='" + queryString + "']" : ':not([data-drupal-link-query])';
      var originalSelectors = ['[data-drupal-link-system-path="' + path.currentPath + '"]'];
      var selectors;

      // If this is the front page, we have to check for the <front> path as well.
      if (path.isFront) {
        originalSelectors.push('[data-drupal-link-system-path="<front>"]');
      }

      // Add language filtering.
      selectors = [].concat(
        // Links without any hreflang attributes (most of them).
        originalSelectors.map(function (selector) { return selector + ':not([hreflang])'; }),
        // Links with hreflang equals to the current language.
        originalSelectors.map(function (selector) { return selector + '[hreflang="' + path.currentLanguage + '"]'; })
      );

      // Add query string selector for pagers, exposed filters.
      selectors = selectors.map(function (current) { return current + querySelector; });

      // Query the DOM.
      var activeLinks = context.querySelectorAll(selectors.join(','));
      for (var i = 0, il = activeLinks.length; i < il; i += 1) {
        activeLinks[i].classList.add('active');
      }
    },
    detach: function (context, settings, trigger) {
      if (trigger === 'unload') {
        var activeLinks = context.querySelectorAll('[data-drupal-link-system-path].active');
        for (var i = 0, il = activeLinks.length; i < il; i += 1) {
          activeLinks[i].classList.remove('active');
        }
      }
    }
  };

})(Drupal, drupalSettings);
;
