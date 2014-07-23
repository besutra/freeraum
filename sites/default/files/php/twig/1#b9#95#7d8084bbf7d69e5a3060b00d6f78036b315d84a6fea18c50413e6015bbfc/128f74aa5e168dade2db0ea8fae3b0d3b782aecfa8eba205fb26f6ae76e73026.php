<?php

/* core/modules/datetime/templates/datetime-wrapper.html.twig */
class __TwigTemplate_b9957d8084bbf7d69e5a3060b00d6f78036b315d84a6fea18c50413e6015bbfc extends Twig_Template
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
        // line 17
        if ((isset($context["title"]) ? $context["title"] : null)) {
            // line 18
            echo "  <h4";
            echo twig_render_var((isset($context["title_attributes"]) ? $context["title_attributes"] : null));
            echo ">";
            echo twig_render_var((isset($context["title"]) ? $context["title"] : null));
            echo "</h4>
";
        }
        // line 20
        echo twig_render_var((isset($context["content"]) ? $context["content"] : null));
        echo "
";
        // line 21
        if ((isset($context["description"]) ? $context["description"] : null)) {
            // line 22
            echo "  <div class=\"description\">";
            echo twig_render_var((isset($context["description"]) ? $context["description"] : null));
            echo "</div>
";
        }
    }

    public function getTemplateName()
    {
        return "core/modules/datetime/templates/datetime-wrapper.html.twig";
    }

    public function isTraitable()
    {
        return false;
    }

    public function getDebugInfo()
    {
        return array (  33 => 21,  63 => 39,  60 => 38,  52 => 35,  47 => 34,  41 => 32,  26 => 28,  22 => 17,  106 => 50,  104 => 49,  101 => 48,  95 => 47,  91 => 45,  89 => 44,  86 => 43,  82 => 41,  71 => 41,  67 => 38,  64 => 37,  62 => 36,  59 => 35,  46 => 31,  42 => 30,  32 => 26,  27 => 24,  54 => 36,  49 => 32,  45 => 31,  39 => 31,  36 => 30,  30 => 25,  28 => 19,  24 => 16,  21 => 18,  35 => 22,  29 => 20,  23 => 22,  19 => 17,);
    }
}
