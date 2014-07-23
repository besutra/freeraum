<?php

/* core/modules/system/templates/field.html.twig */
class __TwigTemplate_a474cede9b0528fac6f3e4abf86a72be387be5e4b3b630602a9b47868084e6a4 extends Twig_Template
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
        // line 32
        echo "<div";
        echo twig_render_var((isset($context["attributes"]) ? $context["attributes"] : null));
        echo ">
  ";
        // line 33
        if ((!(isset($context["label_hidden"]) ? $context["label_hidden"] : null))) {
            // line 34
            echo "    <div class=\"field-label\"";
            echo twig_render_var((isset($context["title_attributes"]) ? $context["title_attributes"] : null));
            echo ">";
            echo twig_render_var((isset($context["label"]) ? $context["label"] : null));
            echo ":&nbsp;</div>
  ";
        }
        // line 36
        echo "  <div class=\"field-items\"";
        echo twig_render_var((isset($context["content_attributes"]) ? $context["content_attributes"] : null));
        echo ">
    ";
        // line 37
        $context['_parent'] = (array) $context;
        $context['_seq'] = twig_ensure_traversable((isset($context["items"]) ? $context["items"] : null));
        foreach ($context['_seq'] as $context["delta"] => $context["item"]) {
            // line 38
            echo "      <div class=\"field-item\"";
            echo twig_render_var($this->getAttribute((isset($context["item_attributes"]) ? $context["item_attributes"] : null), (isset($context["delta"]) ? $context["delta"] : null), array(), "array"));
            echo ">";
            echo twig_render_var((isset($context["item"]) ? $context["item"] : null));
            echo "</div>
    ";
        }
        $_parent = $context['_parent'];
        unset($context['_seq'], $context['_iterated'], $context['delta'], $context['item'], $context['_parent'], $context['loop']);
        $context = array_intersect_key($context, $_parent) + $_parent;
        // line 40
        echo "  </div>
</div>
";
    }

    public function getTemplateName()
    {
        return "core/modules/system/templates/field.html.twig";
    }

    public function isTraitable()
    {
        return false;
    }

    public function getDebugInfo()
    {
        return array (  54 => 40,  43 => 38,  39 => 37,  29 => 30,  26 => 34,  24 => 33,  109 => 106,  106 => 105,  100 => 102,  97 => 101,  95 => 100,  89 => 97,  83 => 96,  79 => 94,  73 => 91,  70 => 90,  68 => 89,  64 => 88,  60 => 87,  57 => 86,  55 => 85,  49 => 83,  41 => 80,  34 => 36,  32 => 78,  28 => 77,  19 => 32,);
    }
}
