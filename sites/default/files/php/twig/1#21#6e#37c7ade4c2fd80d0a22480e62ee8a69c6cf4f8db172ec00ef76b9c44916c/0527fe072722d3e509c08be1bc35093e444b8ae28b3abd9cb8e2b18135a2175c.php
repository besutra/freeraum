<?php

/* core/modules/user/templates/user.html.twig */
class __TwigTemplate_216e37c7ade4c2fd80d0a22480e62ee8a69c6cf4f8db172ec00ef76b9c44916c extends Twig_Template
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
        // line 26
        echo "<article";
        echo twig_render_var((isset($context["attributes"]) ? $context["attributes"] : null));
        echo ">
  ";
        // line 27
        if ((isset($context["content"]) ? $context["content"] : null)) {
            // line 28
            echo twig_render_var((isset($context["content"]) ? $context["content"] : null));
        }
        // line 30
        echo "</article>
";
    }

    public function getTemplateName()
    {
        return "core/modules/user/templates/user.html.twig";
    }

    public function isTraitable()
    {
        return false;
    }

    public function getDebugInfo()
    {
        return array (  29 => 30,  26 => 28,  24 => 27,  109 => 106,  106 => 105,  100 => 102,  97 => 101,  95 => 100,  89 => 97,  83 => 96,  79 => 94,  73 => 91,  70 => 90,  68 => 89,  64 => 88,  60 => 87,  57 => 86,  55 => 85,  49 => 83,  41 => 80,  34 => 79,  32 => 78,  28 => 77,  19 => 26,);
    }
}
