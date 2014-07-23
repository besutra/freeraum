<?php

/* core/themes/bartik/templates/node.html.twig */
class __TwigTemplate_bde9c7ac20eac20b7c183ab8467447e8dc096640075b3857d907a0e093d6d0e2 extends Twig_Template
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
        // line 74
        echo "<article class=\"";
        echo twig_render_var($this->getAttribute((isset($context["attributes"]) ? $context["attributes"] : null), "class"));
        echo " clearfix\"";
        echo twig_render_var(twig_without((isset($context["attributes"]) ? $context["attributes"] : null), "class"));
        echo ">

  <header>
    ";
        // line 77
        echo twig_render_var((isset($context["title_prefix"]) ? $context["title_prefix"] : null));
        echo "
    ";
        // line 78
        if ((!(isset($context["page"]) ? $context["page"] : null))) {
            // line 79
            echo "      <h2 class=\"node__title ";
            echo twig_render_var($this->getAttribute((isset($context["title_attributes"]) ? $context["title_attributes"] : null), "class"));
            echo "\"";
            echo twig_render_var(twig_without((isset($context["title_attributes"]) ? $context["title_attributes"] : null), "class"));
            echo ">
        <a href=\"";
            // line 80
            echo twig_render_var((isset($context["url"]) ? $context["url"] : null));
            echo "\" rel=\"bookmark\">";
            echo twig_render_var((isset($context["label"]) ? $context["label"] : null));
            echo "</a>
      </h2>
    ";
        }
        // line 83
        echo "    ";
        echo twig_render_var((isset($context["title_suffix"]) ? $context["title_suffix"] : null));
        echo "

    ";
        // line 85
        if ((isset($context["display_submitted"]) ? $context["display_submitted"] : null)) {
            // line 86
            echo "      <div class=\"node__meta\">
        ";
            // line 87
            echo twig_render_var((isset($context["author_picture"]) ? $context["author_picture"] : null));
            echo "
        <span";
            // line 88
            echo twig_render_var((isset($context["author_attributes"]) ? $context["author_attributes"] : null));
            echo ">
          ";
            // line 89
            echo t("Submitted by !author_name on @date", array("!author_name" => (isset($context["author_name"]) ? $context["author_name"] : null), "@date" => (isset($context["date"]) ? $context["date"] : null), ));
            // line 90
            echo "        </span>
        ";
            // line 91
            echo twig_render_var((isset($context["metadata"]) ? $context["metadata"] : null));
            echo "
      </div>
    ";
        }
        // line 94
        echo "  </header>

  <div class=\"node__content clearfix ";
        // line 96
        echo twig_render_var($this->getAttribute((isset($context["content_attributes"]) ? $context["content_attributes"] : null), "class"));
        echo "\"";
        echo twig_render_var(twig_without((isset($context["content_attributes"]) ? $context["content_attributes"] : null), "class"));
        echo ">
    ";
        // line 97
        echo twig_render_var(twig_without((isset($context["content"]) ? $context["content"] : null), "comment", "links"));
        echo "
  </div>

  ";
        // line 100
        if ($this->getAttribute((isset($context["content"]) ? $context["content"] : null), "links")) {
            // line 101
            echo "    <div class=\"node__links\">
      ";
            // line 102
            echo twig_render_var($this->getAttribute((isset($context["content"]) ? $context["content"] : null), "links"));
            echo "
    </div>
  ";
        }
        // line 105
        echo "
  ";
        // line 106
        echo twig_render_var($this->getAttribute((isset($context["content"]) ? $context["content"] : null), "comment"));
        echo "

</article>
";
    }

    public function getTemplateName()
    {
        return "core/themes/bartik/templates/node.html.twig";
    }

    public function isTraitable()
    {
        return false;
    }

    public function getDebugInfo()
    {
        return array (  109 => 106,  106 => 105,  100 => 102,  97 => 101,  95 => 100,  89 => 97,  83 => 96,  79 => 94,  73 => 91,  70 => 90,  68 => 89,  64 => 88,  60 => 87,  57 => 86,  55 => 85,  49 => 83,  41 => 80,  34 => 79,  32 => 78,  28 => 77,  19 => 74,);
    }
}
