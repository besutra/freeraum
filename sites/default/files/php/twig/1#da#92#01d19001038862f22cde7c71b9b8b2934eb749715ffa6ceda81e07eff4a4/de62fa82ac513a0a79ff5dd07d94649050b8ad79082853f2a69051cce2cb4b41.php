<?php

/* core/modules/system/templates/system-config-form.html.twig */
class __TwigTemplate_da9201d19001038862f22cde7c71b9b8b2934eb749715ffa6ceda81e07eff4a4 extends Twig_Template
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
        echo twig_render_var((isset($context["form"]) ? $context["form"] : null));
        echo "
";
    }

    public function getTemplateName()
    {
        return "core/modules/system/templates/system-config-form.html.twig";
    }

    public function isTraitable()
    {
        return false;
    }

    public function getDebugInfo()
    {
        return array (  19 => 17,);
    }
}
