<?php
/* Receives vocabulary data as JSON and stores in file */
$vocab = $_POST['data'];

$dataFile = fopen("../data/vocabulary.json", "w") or die("Unable to open file!");
fwrite($dataFile, $vocab);
fclose($dataFile);
?>
