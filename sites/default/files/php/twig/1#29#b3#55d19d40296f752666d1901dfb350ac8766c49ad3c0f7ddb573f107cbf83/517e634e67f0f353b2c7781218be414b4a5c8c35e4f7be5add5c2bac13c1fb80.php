<?php

/* core/modules/system/templates/pager.html.twig */
class __TwigTemplate_29b355d19d40296f752666d1901dfb350ac8766c49ad3c0f7ddb573f107cbf83 extends Twig_Template
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
        // line 14
        if ((isset($context["items"]) ? $context["items"] : null)) {
            // line 15
            echo "  <h2 class=\"visually-hidden\">";
            echo twig_render_var(t("Pages"));
            echo "</h2>
  ";
            // line 16
            echo twig_render_var((isset($context["items"]) ? $context["items"] : null));
            echo "
";
        }
    }

    public function getTemplateName()
    {
        return "core/modules/system/templates/pager.html.twig";
    }

    public function isTraitable()
    {
        return false;
    }

    public function getDebugInfo()
    {
        return array (  31 => 21,  27 => 20,  21 => 15,  155 => 93,  149 => 90,  146 => 89,  143 => 88,  137 => 85,  134 => 84,  131 => 83,  125 => 81,  122 => 80,  116 => 77,  113 => 76,  110 => 75,  104 => 73,  102 => 72,  99 => 71,  93 => 68,  90 => 67,  84 => 64,  81 => 63,  76 => 61,  67 => 57,  58 => 53,  52 => 51,  46 => 48,  36 => 22,  30 => 43,  54 => 40,  43 => 47,  39 => 37,  29 => 30,  26 => 16,  24 => 41,  109 => 106,  106 => 105,  100 => 102,  97 => 101,  95 => 100,  89 => 97,  83 => 96,  79 => 62,  73 => 91,  70 => 58,  68 => 89,  64 => 56,  60 => 87,  57 => 86,  55 => 52,  49 => 83,  41 => 46,  34 => 36,  32 => 78,  28 => 42,  19 => 14,);
    }
}
