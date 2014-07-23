<?php

/* core/modules/views/templates/views-view.html.twig */
class __TwigTemplate_14dd67eb9d3ddc6e9d077f79f6bfeca9394fec5a5d9b8ca00c5400fe8a6626a4 extends Twig_Template
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
        // line 40
        echo "<div";
        echo twig_render_var((isset($context["attributes"]) ? $context["attributes"] : null));
        echo ">
  ";
        // line 41
        echo twig_render_var((isset($context["title_prefix"]) ? $context["title_prefix"] : null));
        echo "
  ";
        // line 42
        if ((isset($context["title"]) ? $context["title"] : null)) {
            // line 43
            echo "    ";
            echo twig_render_var((isset($context["title"]) ? $context["title"] : null));
            echo "
  ";
        }
        // line 45
        echo "  ";
        echo twig_render_var((isset($context["title_suffix"]) ? $context["title_suffix"] : null));
        echo "
  ";
        // line 46
        if ((isset($context["header"]) ? $context["header"] : null)) {
            // line 47
            echo "    <div class=\"view-header\">
      ";
            // line 48
            echo twig_render_var((isset($context["header"]) ? $context["header"] : null));
            echo "
    </div>
  ";
        }
        // line 51
        echo "  ";
        if ((isset($context["exposed"]) ? $context["exposed"] : null)) {
            // line 52
            echo "    <div class=\"view-filters\">
      ";
            // line 53
            echo twig_render_var((isset($context["exposed"]) ? $context["exposed"] : null));
            echo "
    </div>
  ";
        }
        // line 56
        echo "  ";
        if ((isset($context["attachment_before"]) ? $context["attachment_before"] : null)) {
            // line 57
            echo "    <div class=\"attachment attachment-before\">
      ";
            // line 58
            echo twig_render_var((isset($context["attachment_before"]) ? $context["attachment_before"] : null));
            echo "
    </div>
  ";
        }
        // line 61
        echo "
  ";
        // line 62
        if ((isset($context["rows"]) ? $context["rows"] : null)) {
            // line 63
            echo "    <div class=\"view-content\">
      ";
            // line 64
            echo twig_render_var((isset($context["rows"]) ? $context["rows"] : null));
            echo "
    </div>
  ";
        } elseif ((isset($context["empty"]) ? $context["empty"] : null)) {
            // line 67
            echo "    <div class=\"view-empty\">
      ";
            // line 68
            echo twig_render_var((isset($context["empty"]) ? $context["empty"] : null));
            echo "
    </div>
  ";
        }
        // line 71
        echo "
  ";
        // line 72
        if ((isset($context["pager"]) ? $context["pager"] : null)) {
            // line 73
            echo "    ";
            echo twig_render_var((isset($context["pager"]) ? $context["pager"] : null));
            echo "
  ";
        }
        // line 75
        echo "  ";
        if ((isset($context["attachment_after"]) ? $context["attachment_after"] : null)) {
            // line 76
            echo "    <div class=\"attachment attachment-after\">
      ";
            // line 77
            echo twig_render_var((isset($context["attachment_after"]) ? $context["attachment_after"] : null));
            echo "
    </div>
  ";
        }
        // line 80
        echo "  ";
        if ((isset($context["more"]) ? $context["more"] : null)) {
            // line 81
            echo "    ";
            echo twig_render_var((isset($context["more"]) ? $context["more"] : null));
            echo "
  ";
        }
        // line 83
        echo "  ";
        if ((isset($context["footer"]) ? $context["footer"] : null)) {
            // line 84
            echo "    <div class=\"view-footer\">
      ";
            // line 85
            echo twig_render_var((isset($context["footer"]) ? $context["footer"] : null));
            echo "
    </div>
  ";
        }
        // line 88
        echo "  ";
        if ((isset($context["feed_icon"]) ? $context["feed_icon"] : null)) {
            // line 89
            echo "    <div class=\"feed-icon\">
      ";
            // line 90
            echo twig_render_var((isset($context["feed_icon"]) ? $context["feed_icon"] : null));
            echo "
    </div>
  ";
        }
        // line 93
        echo "</div>
";
    }

    public function getTemplateName()
    {
        return "core/modules/views/templates/views-view.html.twig";
    }

    public function isTraitable()
    {
        return false;
    }

    public function getDebugInfo()
    {
        return array (  155 => 93,  149 => 90,  146 => 89,  143 => 88,  137 => 85,  134 => 84,  131 => 83,  125 => 81,  122 => 80,  116 => 77,  113 => 76,  110 => 75,  104 => 73,  102 => 72,  99 => 71,  93 => 68,  90 => 67,  84 => 64,  81 => 63,  76 => 61,  67 => 57,  58 => 53,  52 => 51,  46 => 48,  36 => 45,  30 => 43,  54 => 40,  43 => 47,  39 => 37,  29 => 30,  26 => 34,  24 => 41,  109 => 106,  106 => 105,  100 => 102,  97 => 101,  95 => 100,  89 => 97,  83 => 96,  79 => 62,  73 => 91,  70 => 58,  68 => 89,  64 => 56,  60 => 87,  57 => 86,  55 => 52,  49 => 83,  41 => 46,  34 => 36,  32 => 78,  28 => 42,  19 => 40,);
    }
}
