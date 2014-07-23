<?php

/* core/modules/system/templates/form-element-label.html.twig */
class __TwigTemplate_37d9e3249ed33835e4bb408b4bb07fb2e16fb6c364e082e79d36cad31e0b2374 extends Twig_Template
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
        // line 16
        if (((!twig_test_empty((isset($context["title"]) ? $context["title"] : null))) || (isset($context["required"]) ? $context["required"] : null))) {
            // line 17
            echo "<label";
            echo twig_render_var((isset($context["attributes"]) ? $context["attributes"] : null));
            echo ">";
            echo twig_render_var((isset($context["title"]) ? $context["title"] : null));
            echo "</label>";
        }
    }

    public function getTemplateName()
    {
        return "core/modules/system/templates/form-element-label.html.twig";
    }

    public function isTraitable()
    {
        return false;
    }

    public function getDebugInfo()
    {
        return array (  21 => 17,  77 => 58,  71 => 55,  66 => 54,  63 => 53,  57 => 51,  54 => 50,  35 => 44,  26 => 41,  24 => 40,  51 => 32,  48 => 48,  46 => 47,  43 => 27,  41 => 46,  36 => 24,  34 => 23,  32 => 43,  25 => 20,  23 => 19,  19 => 16,);
    }
}
