<?php

/* core/modules/node/templates/node-preview.html.twig */
class __TwigTemplate_48bb9ed21ce1e8931edc9d214e738151da17451b79f78eb978f2f7450efd11f7 extends Twig_Template
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
        // line 18
        if ((isset($context["preview_teaser"]) ? $context["preview_teaser"] : null)) {
            // line 19
            echo "  <h3>";
            echo twig_render_var(t("Preview trimmed version"));
            echo "</h3>
  ";
            // line 20
            echo twig_render_var((isset($context["teaser"]) ? $context["teaser"] : null));
            echo "
  <h3>";
            // line 21
            echo twig_render_var(t("Preview full version"));
            echo "</h3>
";
        }
        // line 23
        echo twig_render_var((isset($context["full"]) ? $context["full"] : null));
        echo "
";
    }

    public function getTemplateName()
    {
        return "core/modules/node/templates/node-preview.html.twig";
    }

    public function isTraitable()
    {
        return false;
    }

    public function getDebugInfo()
    {
        return array (  35 => 23,  30 => 21,  26 => 20,  21 => 19,  19 => 18,);
    }
}
