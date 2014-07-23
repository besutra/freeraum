<?php

/* core/modules/filter/templates/filter-guidelines.html.twig */
class __TwigTemplate_aedb7269facff0c52e3bd3b116b9497dc04ac2b7d1d4ac9b81909110cc7c59a1 extends Twig_Template
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
        echo "<div";
        echo twig_render_var((isset($context["attributes"]) ? $context["attributes"] : null));
        echo ">
  <h4 class=\"label\">";
        // line 23
        echo twig_render_var(twig_escape_filter($this->env, $this->getAttribute((isset($context["format"]) ? $context["format"] : null), "name")));
        echo "</h4>
  ";
        // line 24
        echo twig_render_var((isset($context["tips"]) ? $context["tips"] : null));
        echo "
</div>
";
    }

    public function getTemplateName()
    {
        return "core/modules/filter/templates/filter-guidelines.html.twig";
    }

    public function isTraitable()
    {
        return false;
    }

    public function getDebugInfo()
    {
        return array (  54 => 34,  49 => 33,  45 => 31,  39 => 29,  36 => 28,  30 => 26,  28 => 24,  24 => 23,  21 => 23,  35 => 28,  29 => 25,  23 => 22,  19 => 22,);
    }
}
