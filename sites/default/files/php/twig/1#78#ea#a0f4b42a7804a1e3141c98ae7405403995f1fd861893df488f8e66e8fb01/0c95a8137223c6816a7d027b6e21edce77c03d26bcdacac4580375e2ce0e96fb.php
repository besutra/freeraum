<?php

/* core/modules/system/templates/fieldset.html.twig */
class __TwigTemplate_78eaa0f4b42a7804a1e3141c98ae7405403995f1fd861893df488f8e66e8fb01 extends Twig_Template
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
        // line 25
        echo "<fieldset";
        echo twig_render_var((isset($context["attributes"]) ? $context["attributes"] : null));
        echo ">
  ";
        // line 26
        if (((!twig_test_empty($this->getAttribute((isset($context["legend"]) ? $context["legend"] : null), "title"))) || (isset($context["required"]) ? $context["required"] : null))) {
            // line 28
            echo "    <legend";
            echo twig_render_var($this->getAttribute((isset($context["legend"]) ? $context["legend"] : null), "attributes"));
            echo "><span class=\"";
            echo twig_render_var($this->getAttribute($this->getAttribute((isset($context["legend_span"]) ? $context["legend_span"] : null), "attributes"), "class"));
            echo "\">";
            echo twig_render_var($this->getAttribute((isset($context["legend"]) ? $context["legend"] : null), "title"));
            echo twig_render_var((isset($context["required"]) ? $context["required"] : null));
            echo "</span></legend>";
        }
        // line 30
        echo "  <div class=\"fieldset-wrapper\">
    ";
        // line 31
        if ((isset($context["prefix"]) ? $context["prefix"] : null)) {
            // line 32
            echo "      <span class=\"field-prefix\">";
            echo twig_render_var((isset($context["prefix"]) ? $context["prefix"] : null));
            echo "</span>
    ";
        }
        // line 34
        echo "    ";
        echo twig_render_var((isset($context["children"]) ? $context["children"] : null));
        echo "
    ";
        // line 35
        if ((isset($context["suffix"]) ? $context["suffix"] : null)) {
            // line 36
            echo "      <span class=\"field-suffix\">";
            echo twig_render_var((isset($context["suffix"]) ? $context["suffix"] : null));
            echo "</span>
    ";
        }
        // line 38
        echo "    ";
        if ($this->getAttribute((isset($context["description"]) ? $context["description"] : null), "content")) {
            // line 39
            echo "      <div";
            echo twig_render_var($this->getAttribute((isset($context["description"]) ? $context["description"] : null), "attributes"));
            echo ">";
            echo twig_render_var($this->getAttribute((isset($context["description"]) ? $context["description"] : null), "content"));
            echo "</div>
    ";
        }
        // line 41
        echo "  </div>
</fieldset>
";
    }

    public function getTemplateName()
    {
        return "core/modules/system/templates/fieldset.html.twig";
    }

    public function isTraitable()
    {
        return false;
    }

    public function getDebugInfo()
    {
        return array (  63 => 39,  60 => 38,  52 => 35,  47 => 34,  41 => 32,  26 => 28,  22 => 17,  106 => 50,  104 => 49,  101 => 48,  95 => 47,  91 => 45,  89 => 44,  86 => 43,  82 => 41,  71 => 41,  67 => 38,  64 => 37,  62 => 36,  59 => 35,  46 => 31,  42 => 30,  32 => 26,  27 => 24,  54 => 36,  49 => 32,  45 => 31,  39 => 31,  36 => 30,  30 => 25,  28 => 19,  24 => 26,  21 => 22,  35 => 27,  29 => 25,  23 => 22,  19 => 25,);
    }
}
