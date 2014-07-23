<?php

/* core/modules/views/templates/views-view-unformatted.html.twig */
class __TwigTemplate_f267dde3e2898e33c1049d44e62cf92a2237604311eefb502e8ae6dfd0049e08 extends Twig_Template
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
            echo "  <h3>";
            echo twig_render_var((isset($context["title"]) ? $context["title"] : null));
            echo "</h3>
";
        }
        // line 20
        $context['_parent'] = (array) $context;
        $context['_seq'] = twig_ensure_traversable((isset($context["rows"]) ? $context["rows"] : null));
        foreach ($context['_seq'] as $context["_key"] => $context["row"]) {
            // line 21
            echo "  <div";
            echo twig_render_var($this->getAttribute((isset($context["row"]) ? $context["row"] : null), "attributes"));
            echo ">
    ";
            // line 22
            echo twig_render_var($this->getAttribute((isset($context["row"]) ? $context["row"] : null), "content"));
            echo "
  </div>
";
        }
        $_parent = $context['_parent'];
        unset($context['_seq'], $context['_iterated'], $context['_key'], $context['row'], $context['_parent'], $context['loop']);
        $context = array_intersect_key($context, $_parent) + $_parent;
    }

    public function getTemplateName()
    {
        return "core/modules/views/templates/views-view-unformatted.html.twig";
    }

    public function isTraitable()
    {
        return false;
    }

    public function getDebugInfo()
    {
        return array (  31 => 21,  27 => 20,  21 => 18,  155 => 93,  149 => 90,  146 => 89,  143 => 88,  137 => 85,  134 => 84,  131 => 83,  125 => 81,  122 => 80,  116 => 77,  113 => 76,  110 => 75,  104 => 73,  102 => 72,  99 => 71,  93 => 68,  90 => 67,  84 => 64,  81 => 63,  76 => 61,  67 => 57,  58 => 53,  52 => 51,  46 => 48,  36 => 22,  30 => 43,  54 => 40,  43 => 47,  39 => 37,  29 => 30,  26 => 34,  24 => 41,  109 => 106,  106 => 105,  100 => 102,  97 => 101,  95 => 100,  89 => 97,  83 => 96,  79 => 62,  73 => 91,  70 => 58,  68 => 89,  64 => 56,  60 => 87,  57 => 86,  55 => 52,  49 => 83,  41 => 46,  34 => 36,  32 => 78,  28 => 42,  19 => 17,);
    }
}
