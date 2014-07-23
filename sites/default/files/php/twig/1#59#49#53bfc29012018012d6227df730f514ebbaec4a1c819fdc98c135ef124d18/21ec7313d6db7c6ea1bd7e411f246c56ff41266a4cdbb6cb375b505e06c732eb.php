<?php

/* core/themes/bartik/templates/page.html.twig */
class __TwigTemplate_594953bfc29012018012d6227df730f514ebbaec4a1c819fdc98c135ef124d18 extends Twig_Template
{
    public function __construct(Twig_Environment $env)
    {
        parent::__construct($env);

        $this->parent = false;

        $this->blocks = array(
        );
    }

    protected function doDisplay(array $context, array $blocks = array())
    {
        // line 80
        echo "<div id=\"page-wrapper\"><div id=\"page\">

  <header id=\"header\" class=\"";
        // line 82
        echo twig_render_var((((isset($context["secondary_menu"]) ? $context["secondary_menu"] : null)) ? ("with-secondary-menu") : ("without-secondary-menu")));
        echo "\" role=\"banner\" aria-label=\"";
        echo twig_render_var(t("Site header"));
        echo "\"><div class=\"section clearfix\">
   ";
        // line 83
        if ((isset($context["secondary_menu"]) ? $context["secondary_menu"] : null)) {
            // line 84
            echo "      <nav id=\"secondary-menu\" class=\"navigation\" role=\"navigation\"  aria-labelledby=\"links__system_secondary_menu\">
        ";
            // line 85
            echo twig_render_var((isset($context["secondary_menu"]) ? $context["secondary_menu"] : null));
            echo "
      </nav> <!-- /#secondary-menu -->
    ";
        }
        // line 88
        echo "
    ";
        // line 89
        if ((isset($context["logo"]) ? $context["logo"] : null)) {
            // line 90
            echo "      <a href=\"";
            echo twig_render_var((isset($context["front_page"]) ? $context["front_page"] : null));
            echo "\" title=\"";
            echo twig_render_var(t("Home"));
            echo "\" rel=\"home\" id=\"logo\">
        <img src=\"";
            // line 91
            echo twig_render_var((isset($context["logo"]) ? $context["logo"] : null));
            echo "\" alt=\"";
            echo twig_render_var(t("Home"));
            echo "\" />
      </a>
    ";
        }
        // line 94
        echo "
    ";
        // line 95
        if (((isset($context["site_name"]) ? $context["site_name"] : null) || (isset($context["site_slogan"]) ? $context["site_slogan"] : null))) {
            // line 96
            echo "      <div id=\"name-and-slogan\"";
            if (((isset($context["hide_site_name"]) ? $context["hide_site_name"] : null) && (isset($context["hide_site_slogan"]) ? $context["hide_site_slogan"] : null))) {
                echo " class=\"visually-hidden\"";
            }
            echo ">
        ";
            // line 97
            if ((isset($context["site_name"]) ? $context["site_name"] : null)) {
                // line 98
                echo "          ";
                if ((isset($context["title"]) ? $context["title"] : null)) {
                    // line 99
                    echo "            <div id=\"site-name\"";
                    if ((isset($context["hide_site_name"]) ? $context["hide_site_name"] : null)) {
                        echo " class=\"visually-hidden\"";
                    }
                    echo ">
              <strong>
                <a href=\"";
                    // line 101
                    echo twig_render_var((isset($context["front_page"]) ? $context["front_page"] : null));
                    echo "\" title=\"";
                    echo twig_render_var(t("Home"));
                    echo "\" rel=\"home\"><span>";
                    echo twig_render_var((isset($context["site_name"]) ? $context["site_name"] : null));
                    echo "</span></a>
              </strong>
            </div>
          ";
                    // line 105
                    echo "          ";
                } else {
                    // line 106
                    echo "            <h1 id=\"site-name\"";
                    if ((isset($context["hide_site_name"]) ? $context["hide_site_name"] : null)) {
                        echo " class=\"visually-hidden\" ";
                    }
                    echo ">
              <a href=\"";
                    // line 107
                    echo twig_render_var((isset($context["front_page"]) ? $context["front_page"] : null));
                    echo "\" title=\"";
                    echo twig_render_var(t("Home"));
                    echo "\" rel=\"home\"><span>";
                    echo twig_render_var((isset($context["site_name"]) ? $context["site_name"] : null));
                    echo "</span></a>
            </h1>
          ";
                }
                // line 110
                echo "        ";
            }
            // line 111
            echo "
        ";
            // line 112
            if ((isset($context["site_slogan"]) ? $context["site_slogan"] : null)) {
                // line 113
                echo "          <div id=\"site-slogan\"";
                if ((isset($context["hide_site_slogan"]) ? $context["hide_site_slogan"] : null)) {
                    echo " class=\"visually-hidden\"";
                }
                echo ">
            ";
                // line 114
                echo twig_render_var((isset($context["site_slogan"]) ? $context["site_slogan"] : null));
                echo "
          </div>
        ";
            }
            // line 117
            echo "      </div><!-- /#name-and-slogan -->
    ";
        }
        // line 119
        echo "
    ";
        // line 120
        echo twig_render_var($this->getAttribute((isset($context["page"]) ? $context["page"] : null), "header"));
        echo "

    ";
        // line 122
        if ((isset($context["main_menu"]) ? $context["main_menu"] : null)) {
            // line 123
            echo "      <nav id =\"main-menu\" class=\"navigation\" role=\"navigation\" aria-labelledby=\"links__system_main_menu\">
        <div id=\"nav\"></div>
        <div id=\"no-nav\"></div>
        <a class=\"main-menu-reveal\" href=\"#nav\">";
            // line 126
            echo twig_render_var(t("Menu"));
            echo "</a>
        <a class=\"main-menu-reveal main-menu-reveal--hide\" href=\"#no-nav\">";
            // line 127
            echo twig_render_var(t("Menu"));
            echo "</a>
        ";
            // line 128
            echo twig_render_var((isset($context["main_menu"]) ? $context["main_menu"] : null));
            echo "
      </nav> <!-- /#main-menu -->
    ";
        }
        // line 131
        echo "  </div></header> <!-- /.section, /#header-->

  ";
        // line 133
        if ((isset($context["messages"]) ? $context["messages"] : null)) {
            // line 134
            echo "    <div id=\"messages\"><div class=\"section clearfix\">
      ";
            // line 135
            echo twig_render_var((isset($context["messages"]) ? $context["messages"] : null));
            echo "
    </div></div> <!-- /.section, /#messages -->
  ";
        }
        // line 138
        echo "
  ";
        // line 139
        if ($this->getAttribute((isset($context["page"]) ? $context["page"] : null), "featured")) {
            // line 140
            echo "    <aside id=\"featured\"><div class=\"section clearfix\">
      ";
            // line 141
            echo twig_render_var($this->getAttribute((isset($context["page"]) ? $context["page"] : null), "featured"));
            echo "
    </div></aside> <!-- /.section, /#featured -->
  ";
        }
        // line 144
        echo "
  <div id=\"main-wrapper\" class=\"clearfix\"><div id=\"main\" class=\"clearfix\">
    ";
        // line 146
        echo twig_render_var((isset($context["breadcrumb"]) ? $context["breadcrumb"] : null));
        echo "

    <main id=\"content\" class=\"column\" role=\"main\"><section class=\"section\">
      ";
        // line 149
        if ($this->getAttribute((isset($context["page"]) ? $context["page"] : null), "highlighted")) {
            echo "<div id=\"highlighted\">";
            echo twig_render_var($this->getAttribute((isset($context["page"]) ? $context["page"] : null), "highlighted"));
            echo "</div>";
        }
        // line 150
        echo "      <a id=\"main-content\"></a>
      ";
        // line 151
        echo twig_render_var((isset($context["title_prefix"]) ? $context["title_prefix"] : null));
        echo "
        ";
        // line 152
        if ((isset($context["title"]) ? $context["title"] : null)) {
            // line 153
            echo "          <h1 class=\"title\" id=\"page-title\">
            ";
            // line 154
            echo twig_render_var((isset($context["title"]) ? $context["title"] : null));
            echo "
          </h1>
        ";
        }
        // line 157
        echo "      ";
        echo twig_render_var((isset($context["title_suffix"]) ? $context["title_suffix"] : null));
        echo "
        ";
        // line 158
        if ((isset($context["tabs"]) ? $context["tabs"] : null)) {
            // line 159
            echo "          <nav class=\"tabs\" role=\"navigation\" aria-label=\"";
            echo twig_render_var(t("Tabs"));
            echo "\">
            ";
            // line 160
            echo twig_render_var((isset($context["tabs"]) ? $context["tabs"] : null));
            echo "
          </nav>
        ";
        }
        // line 163
        echo "      ";
        echo twig_render_var($this->getAttribute((isset($context["page"]) ? $context["page"] : null), "help"));
        echo "
        ";
        // line 164
        if ((isset($context["action_links"]) ? $context["action_links"] : null)) {
            // line 165
            echo "          <ul class=\"action-links\">
            ";
            // line 166
            echo twig_render_var((isset($context["action_links"]) ? $context["action_links"] : null));
            echo "
          </ul>
        ";
        }
        // line 169
        echo "      ";
        echo twig_render_var($this->getAttribute((isset($context["page"]) ? $context["page"] : null), "content"));
        echo "
      ";
        // line 170
        echo twig_render_var((isset($context["feed_icons"]) ? $context["feed_icons"] : null));
        echo "
    </section></main> <!-- /.section, /#content -->

    ";
        // line 173
        if ($this->getAttribute((isset($context["page"]) ? $context["page"] : null), "sidebar_first")) {
            // line 174
            echo "      <div id=\"sidebar-first\" class=\"column sidebar\"><aside class=\"section\">
        ";
            // line 175
            echo twig_render_var($this->getAttribute((isset($context["page"]) ? $context["page"] : null), "sidebar_first"));
            echo "
      </aside></div><!-- /.section, /#sidebar-first -->
    ";
        }
        // line 178
        echo "
    ";
        // line 179
        if ($this->getAttribute((isset($context["page"]) ? $context["page"] : null), "sidebar_second")) {
            // line 180
            echo "      <div id=\"sidebar-second\" class=\"column sidebar\"><aside class=\"section\">
        ";
            // line 181
            echo twig_render_var($this->getAttribute((isset($context["page"]) ? $context["page"] : null), "sidebar_second"));
            echo "
      </aside></div><!-- /.section, /#sidebar-second -->
    ";
        }
        // line 184
        echo "
  </div></div><!-- /#main, /#main-wrapper -->

  ";
        // line 187
        if ((($this->getAttribute((isset($context["page"]) ? $context["page"] : null), "triptych_first") || $this->getAttribute((isset($context["page"]) ? $context["page"] : null), "triptych_middle")) || $this->getAttribute((isset($context["page"]) ? $context["page"] : null), "triptych_last"))) {
            // line 188
            echo "    <div id=\"triptych-wrapper\"><aside id=\"triptych\" class=\"clearfix\">
      ";
            // line 189
            echo twig_render_var($this->getAttribute((isset($context["page"]) ? $context["page"] : null), "triptych_first"));
            echo "
      ";
            // line 190
            echo twig_render_var($this->getAttribute((isset($context["page"]) ? $context["page"] : null), "triptych_middle"));
            echo "
      ";
            // line 191
            echo twig_render_var($this->getAttribute((isset($context["page"]) ? $context["page"] : null), "triptych_last"));
            echo "
    </aside></div><!-- /#triptych, /#triptych-wrapper -->
  ";
        }
        // line 194
        echo "
  <div id=\"footer-wrapper\"><footer class=\"section\">

    ";
        // line 197
        if (((($this->getAttribute((isset($context["page"]) ? $context["page"] : null), "footer_firstcolumn") || $this->getAttribute((isset($context["page"]) ? $context["page"] : null), "footer_secondcolumn")) || $this->getAttribute((isset($context["page"]) ? $context["page"] : null), "footer_thirdcolumn")) || $this->getAttribute((isset($context["page"]) ? $context["page"] : null), "footer_fourthcolumn"))) {
            // line 198
            echo "      <div id=\"footer-columns\" class=\"clearfix\">
        ";
            // line 199
            echo twig_render_var($this->getAttribute((isset($context["page"]) ? $context["page"] : null), "footer_firstcolumn"));
            echo "
        ";
            // line 200
            echo twig_render_var($this->getAttribute((isset($context["page"]) ? $context["page"] : null), "footer_secondcolumn"));
            echo "
        ";
            // line 201
            echo twig_render_var($this->getAttribute((isset($context["page"]) ? $context["page"] : null), "footer_thirdcolumn"));
            echo "
        ";
            // line 202
            echo twig_render_var($this->getAttribute((isset($context["page"]) ? $context["page"] : null), "footer_fourthcolumn"));
            echo "
      </div><!-- /#footer-columns -->
    ";
        }
        // line 205
        echo "
    ";
        // line 206
        if ($this->getAttribute((isset($context["page"]) ? $context["page"] : null), "footer")) {
            // line 207
            echo "      <div id=\"footer\" role=\"contentinfo\" class=\"clearfix\">
        ";
            // line 208
            echo twig_render_var($this->getAttribute((isset($context["page"]) ? $context["page"] : null), "footer"));
            echo "
      </div> <!-- /#footer -->
   ";
        }
        // line 211
        echo "
  </footer></div> <!-- /.section, /#footer-wrapper -->

</div></div> <!-- /#page, /#page-wrapper -->
";
    }

    public function getTemplateName()
    {
        return "core/themes/bartik/templates/page.html.twig";
    }

    public function isTraitable()
    {
        return false;
    }

    public function getDebugInfo()
    {
        return array (  368 => 211,  362 => 208,  359 => 207,  357 => 206,  354 => 205,  348 => 202,  344 => 201,  340 => 200,  336 => 199,  333 => 198,  331 => 197,  326 => 194,  320 => 191,  316 => 190,  312 => 189,  309 => 188,  307 => 187,  302 => 184,  296 => 181,  293 => 180,  291 => 179,  288 => 178,  282 => 175,  279 => 174,  277 => 173,  271 => 170,  266 => 169,  260 => 166,  257 => 165,  255 => 164,  250 => 163,  244 => 160,  239 => 159,  237 => 158,  232 => 157,  226 => 154,  223 => 153,  221 => 152,  217 => 151,  214 => 150,  208 => 149,  202 => 146,  198 => 144,  192 => 141,  189 => 140,  187 => 139,  184 => 138,  178 => 135,  175 => 134,  173 => 133,  169 => 131,  163 => 128,  159 => 127,  150 => 123,  148 => 122,  140 => 119,  136 => 117,  130 => 114,  123 => 113,  121 => 112,  118 => 111,  115 => 110,  105 => 107,  98 => 106,  85 => 101,  77 => 99,  74 => 98,  72 => 97,  65 => 96,  63 => 95,  45 => 90,  40 => 88,  23 => 82,  31 => 84,  27 => 20,  21 => 15,  155 => 126,  149 => 90,  146 => 89,  143 => 120,  137 => 85,  134 => 84,  131 => 83,  125 => 81,  122 => 80,  116 => 77,  113 => 76,  110 => 75,  104 => 73,  102 => 72,  99 => 71,  93 => 68,  90 => 67,  84 => 64,  81 => 63,  76 => 61,  67 => 57,  58 => 53,  52 => 91,  46 => 48,  36 => 22,  30 => 43,  54 => 40,  43 => 89,  39 => 37,  29 => 83,  26 => 16,  24 => 41,  109 => 106,  106 => 105,  100 => 102,  97 => 101,  95 => 105,  89 => 97,  83 => 96,  79 => 62,  73 => 91,  70 => 58,  68 => 89,  64 => 56,  60 => 94,  57 => 86,  55 => 52,  49 => 83,  41 => 46,  34 => 85,  32 => 78,  28 => 42,  19 => 80,);
    }
}
