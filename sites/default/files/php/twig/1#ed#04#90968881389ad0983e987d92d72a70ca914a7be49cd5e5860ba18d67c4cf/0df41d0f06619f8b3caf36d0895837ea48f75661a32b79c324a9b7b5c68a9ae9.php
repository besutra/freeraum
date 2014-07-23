<?php

/* core/modules/system/templates/container.html.twig */
class __TwigTemplate_ed0490968881389ad0983e987d92d72a70ca914a7be49cd5e5860ba18d67c4cf extends Twig_Template
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
        // line 18
        echo "<div";
        echo twig_render_var((isset($context["attributes"]) ? $context["attributes"] : null));
        echo ">";
        echo twig_render_var((isset($context["children"]) ? $context["children"] : null));
        echo "</div>
";
    }

    public function getTemplateName()
    {
        return "core/modules/system/templates/container.html.twig";
    }

    public function isTraitable()
    {
        return false;
    }

    public function getDebugInfo()
    {
        return array (  21 => 17,  77 => 58,  71 => 55,  66 => 54,  63 => 53,  57 => 51,  54 => 50,  35 => 44,  26 => 41,  24 => 40,  51 => 32,  48 => 48,  46 => 47,  43 => 27,  41 => 46,  36 => 24,  34 => 23,  32 => 43,  25 => 20,  23 => 19,  19 => 18,);
    }
}
