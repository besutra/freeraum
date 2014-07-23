<?php

/* core/modules/node/templates/node.html.twig */
class __TwigTemplate_e2aff3926d26654730186bc3c0dd863e5223892cc215fddb68f2b89dd3f7e9d1 extends Twig_Template
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
        // line 80
        echo "<article";
        echo twig_render_var((isset($context["attributes"]) ? $context["attributes"] : null));
        echo ">

  ";
        // line 82
        echo twig_render_var((isset($context["title_prefix"]) ? $context["title_prefix"] : null));
        echo "
  ";
        // line 83
        if ((!(isset($context["page"]) ? $context["page"] : null))) {
            // line 84
            echo "    <h2";
            echo twig_render_var((isset($context["title_attributes"]) ? $context["title_attributes"] : null));
            echo ">
      <a href=\"";
            // line 85
            echo twig_render_var((isset($context["url"]) ? $context["url"] : null));
            echo "\" rel=\"bookmark\">";
            echo twig_render_var((isset($context["label"]) ? $context["label"] : null));
            echo "</a>
    </h2>
  ";
        }
        // line 88
        echo "  ";
        echo twig_render_var((isset($context["title_suffix"]) ? $context["title_suffix"] : null));
        echo "

  ";
        // line 90
        if ((isset($context["display_submitted"]) ? $context["display_submitted"] : null)) {
            // line 91
            echo "    <footer class=\"node__meta\">
      ";
            // line 92
            echo twig_render_var((isset($context["author_picture"]) ? $context["author_picture"] : null));
            echo "
      <div class=\"node__submitted ";
            // line 93
            echo twig_render_var($this->getAttribute((isset($context["author_attributes"]) ? $context["author_attributes"] : null), "class"));
            echo "\"";
            echo twig_render_var(twig_without((isset($context["author_attributes"]) ? $context["author_attributes"] : null), "class"));
            echo ">
        ";
            // line 94
            echo t("Submitted by !author_name on @date", array("!author_name" => (isset($context["author_name"]) ? $context["author_name"] : null), "@date" => (isset($context["date"]) ? $context["date"] : null), ));
            // line 95
            echo "        ";
            echo twig_render_var((isset($context["metadata"]) ? $context["metadata"] : null));
            echo "
      </div>
    </footer>
  ";
        }
        // line 99
        echo "
  <div class=\"node__content ";
        // line 100
        echo twig_render_var($this->getAttribute((isset($context["content_attributes"]) ? $context["content_attributes"] : null), "class"));
        echo "\"";
        echo twig_render_var(twig_without((isset($context["content_attributes"]) ? $context["content_attributes"] : null), "class"));
        echo ">
    ";
        // line 101
        echo twig_render_var(twig_without((isset($context["content"]) ? $context["content"] : null), "links"));
        echo "
  </div>

  ";
        // line 104
        if ($this->getAttribute((isset($context["content"]) ? $context["content"] : null), "links")) {
            // line 105
            echo "    <div class=\"node__links\">
      ";
            // line 106
            echo twig_render_var($this->getAttribute((isset($context["content"]) ? $context["content"] : null), "links"));
            echo "
    </div>
  ";
        }
        // line 109
        echo "
</article>
";
    }

    public function getTemplateName()
    {
        return "core/modules/node/templates/node.html.twig";
    }

    public function isTraitable()
    {
        return false;
    }

    public function getDebugInfo()
    {
        return array (  101 => 109,  95 => 106,  92 => 105,  90 => 104,  84 => 101,  78 => 100,  75 => 99,  67 => 95,  65 => 94,  59 => 93,  55 => 92,  52 => 91,  50 => 90,  44 => 88,  36 => 85,  31 => 84,  29 => 83,  25 => 82,  23 => 16,  35 => 23,  30 => 21,  26 => 20,  21 => 19,  19 => 80,);
    }
}
