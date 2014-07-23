<?php

/* core/modules/file/templates/file-widget.html.twig */
class __TwigTemplate_4c8db4aa0fb68b3dd3349fcf8605f0f78a37ef63a6fd76a166dfcbcd52868c9e extends Twig_Template
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
        // line 15
        echo "<div";
        echo twig_render_var((isset($context["attributes"]) ? $context["attributes"] : null));
        echo ">
  ";
        // line 16
        echo twig_render_var((isset($context["element"]) ? $context["element"] : null));
        echo "
</div>
";
    }

    public function getTemplateName()
    {
        return "core/modules/file/templates/file-widget.html.twig";
    }

    public function isTraitable()
    {
        return false;
    }

    public function getDebugInfo()
    {
        return array (  26 => 18,  22 => 17,  106 => 50,  104 => 49,  101 => 48,  95 => 47,  91 => 45,  89 => 44,  86 => 43,  82 => 41,  71 => 39,  67 => 38,  64 => 37,  62 => 36,  59 => 35,  46 => 31,  42 => 30,  32 => 26,  27 => 24,  54 => 33,  49 => 32,  45 => 31,  39 => 29,  36 => 21,  30 => 25,  28 => 19,  24 => 16,  21 => 22,  35 => 27,  29 => 25,  23 => 22,  19 => 15,);
    }
}
