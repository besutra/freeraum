<?php

/* core/modules/node/templates/node-edit-form.html.twig */
class __TwigTemplate_205474ac11fd42b8c746019d08e25aa2d7b287237827795548c2bad67d6a11eb extends Twig_Template
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
        // line 20
        echo "<div class=\"layout-node-form clearfix\">
  <div class=\"layout-region layout-region-node-main\">
    ";
        // line 22
        echo twig_render_var(twig_without((isset($context["form"]) ? $context["form"] : null), "advanced", "actions"));
        echo "
  </div>
  <div class=\"layout-region layout-region-node-secondary\">
    ";
        // line 25
        echo twig_render_var($this->getAttribute((isset($context["form"]) ? $context["form"] : null), "advanced"));
        echo "
  </div>
  <div class=\"layout-region layout-region-node-footer\">
    ";
        // line 28
        echo twig_render_var($this->getAttribute((isset($context["form"]) ? $context["form"] : null), "actions"));
        echo "
  </div>
</div>
";
    }

    public function getTemplateName()
    {
        return "core/modules/node/templates/node-edit-form.html.twig";
    }

    public function isTraitable()
    {
        return false;
    }

    public function getDebugInfo()
    {
        return array (  35 => 28,  29 => 25,  23 => 22,  19 => 20,);
    }
}
