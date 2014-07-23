<?php

/* core/modules/system/templates/select.html.twig */
class __TwigTemplate_feedfccf71255dd22210906cfd12d84af65d2ef5ecc065f5c4d887820a833de7 extends Twig_Template
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
        echo "<select";
        echo twig_render_var((isset($context["attributes"]) ? $context["attributes"] : null));
        echo ">";
        echo twig_render_var((isset($context["options"]) ? $context["options"] : null));
        echo "</select>
";
    }

    public function getTemplateName()
    {
        return "core/modules/system/templates/select.html.twig";
    }

    public function isTraitable()
    {
        return false;
    }

    public function getDebugInfo()
    {
        return array (  51 => 32,  48 => 30,  46 => 29,  43 => 27,  41 => 26,  36 => 24,  34 => 23,  32 => 22,  25 => 20,  23 => 19,  19 => 15,);
    }
}
