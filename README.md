freeraum
========

Freeraum - Tu Espacio Libre

Test the site at www.freeraum.com

Tutorial drupal with git: https://www.drupal.org/node/803746

<h3> Steps to clone the project to your local environment:</h3>

<h4> Step 1: Clone drupal core on you local environment:</h4>

$ git clone --branch 8.x http://git.drupal.org/project/drupal.git freeraum

$ cd freeraum

$ git tag 

You will see all the branches of drupal available choose the last one

$ git checkout <tag-name>

For example:

$git checkout 8.0-alpha13

<h4> Rename Drupal core </h4>

$ git remote 

gives you the name of the drupal core's repository (origin). You do not want to commit to it so rename it locally:

$ git remote rename origin drupal






