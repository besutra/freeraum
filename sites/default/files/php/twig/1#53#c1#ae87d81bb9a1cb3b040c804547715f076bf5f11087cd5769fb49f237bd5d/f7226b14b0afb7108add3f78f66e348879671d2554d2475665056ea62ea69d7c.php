<?php

/* core/modules/system/templates/field-multiple-value-form.html.twig */
class __TwigTemplate_53c1ae87d81bb9a1cb3b040c804547715f076bf5f11087cd5769fb49f237bd5d extends Twig_Template
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
        // line 22
        if ((isset($context["multiple"]) ? $context["multiple"] : null)) {
            // line 23
            echo "  <div class=\"form-item\">
    ";
            // line 24
            echo twig_render_var((isset($context["table"]) ? $context["table"] : null));
            echo "
    ";
            // line 25
            if ((isset($context["description"]) ? $context["description"] : null)) {
                // line 26
                echo "      <div class=\"description\">";
                echo twig_render_var((isset($context["description"]) ? $context["description"] : null));
                echo "</div>
    ";
            }
            // line 28
            echo "    ";
            if ((isset($context["button"]) ? $context["button"] : null)) {
                // line 29
                echo "      <div class=\"clearfix\">";
                echo twig_render_var((isset($context["button"]) ? $context["button"] : null));
                echo "</div>
    ";
            }
            // line 31
            echo "  </div>
";
        } else {
            // line 33
            echo "  ";
            $context['_parent'] = (array) $context;
            $context['_seq'] = twig_ensure_traversable((isset($context["elements"]) ? $context["elements"] : null));
            foreach ($context['_seq'] as $context["_key"] => $context["element"]) {
                // line 34
                echo "    ";
                echo twig_render_var((isset($context["element"]) ? $context["element"] : null));
                echo "
  ";
            }
            $_parent = $context['_parent'];
            unset($context['_seq'], $context['_iterated'], $context['_key'], $context['element'], $context['_parent'], $context['loop']);
            $context = array_intersect_key($context, $_parent) + $_parent;
        }
    }

    public function getTemplateName()
    {
        return "core/modules/system/templates/field-multiple-value-form.html.twig";
    }

    public function isTraitable()
    {
        return false;
    }

    public function getDebugInfo()
    {
        return array (  54 => 34,  49 => 33,  45 => 31,  39 => 29,  36 => 28,  30 => 26,  28 => 25,  24 => 24,  21 => 23,  35 => 28,  29 => 25,  23 => 22,  19 => 22,);
    }
}
