<?php

/* core/modules/rdf/templates/rdf-metadata.html.twig */
class __TwigTemplate_a1d9b9d352d95f3f2f3226228e2d63a756c5dfab38131a9c4f3417ee938e659c extends Twig_Template
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
        $context['_parent'] = (array) $context;
        $context['_seq'] = twig_ensure_traversable((isset($context["metadata"]) ? $context["metadata"] : null));
        foreach ($context['_seq'] as $context["_key"] => $context["attributes"]) {
            // line 16
            echo "  <span";
            echo twig_render_var((isset($context["attributes"]) ? $context["attributes"] : null));
            echo "></span>
";
        }
        $_parent = $context['_parent'];
        unset($context['_seq'], $context['_iterated'], $context['_key'], $context['attributes'], $context['_parent'], $context['loop']);
        $context = array_intersect_key($context, $_parent) + $_parent;
    }

    public function getTemplateName()
    {
        return "core/modules/rdf/templates/rdf-metadata.html.twig";
    }

    public function isTraitable()
    {
        return false;
    }

    public function getDebugInfo()
    {
        return array (  23 => 16,  35 => 23,  30 => 21,  26 => 20,  21 => 19,  19 => 15,);
    }
}
