<?php

/* core/modules/node/templates/field--node--title.html.twig */
class __TwigTemplate_fb5430c32db4d93e0278f206b4d3fc83fae7f4cfc87b75c0a72abc75ff902e04 extends Twig_Template
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
        echo "<span";
        echo twig_render_var((isset($context["attributes"]) ? $context["attributes"] : null));
        echo ">";
        echo twig_render_var((isset($context["items"]) ? $context["items"] : null));
        echo "</span>
";
    }

    public function getTemplateName()
    {
        return "core/modules/node/templates/field--node--title.html.twig";
    }

    public function isTraitable()
    {
        return false;
    }

    public function getDebugInfo()
    {
        return array (  109 => 106,  106 => 105,  100 => 102,  97 => 101,  95 => 100,  89 => 97,  83 => 96,  79 => 94,  73 => 91,  70 => 90,  68 => 89,  64 => 88,  60 => 87,  57 => 86,  55 => 85,  49 => 83,  41 => 80,  34 => 79,  32 => 78,  28 => 77,  19 => 18,);
    }
}
