<?php

/* core/modules/filter/templates/text-format-wrapper.html.twig */
class __TwigTemplate_591cf87cedd8c05f1b84d7d382d848e9d31911050cef020e94aebbe6752bba0a extends Twig_Template
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
        echo "<div class=\"text-format-wrapper form-item\">
  ";
        // line 17
        echo twig_render_var((isset($context["children"]) ? $context["children"] : null));
        echo "
  ";
        // line 18
        if ((isset($context["description"]) ? $context["description"] : null)) {
            // line 19
            echo "    <div";
            echo twig_render_var((isset($context["attributes"]) ? $context["attributes"] : null));
            echo ">";
            echo twig_render_var((isset($context["description"]) ? $context["description"] : null));
            echo "</div>
  ";
        }
        // line 21
        echo "</div>
";
    }

    public function getTemplateName()
    {
        return "core/modules/filter/templates/text-format-wrapper.html.twig";
    }

    public function isTraitable()
    {
        return false;
    }

    public function getDebugInfo()
    {
        return array (  26 => 18,  22 => 17,  106 => 50,  104 => 49,  101 => 48,  95 => 47,  91 => 45,  89 => 44,  86 => 43,  82 => 41,  71 => 39,  67 => 38,  64 => 37,  62 => 36,  59 => 35,  46 => 31,  42 => 30,  32 => 26,  27 => 24,  54 => 33,  49 => 32,  45 => 31,  39 => 29,  36 => 21,  30 => 25,  28 => 19,  24 => 23,  21 => 22,  35 => 27,  29 => 25,  23 => 22,  19 => 16,);
    }
}
