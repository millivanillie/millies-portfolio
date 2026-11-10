Put your project images in this folder.

Your portrait in the intro title: millie-pill.jpg (head-to-waist crop of millie.jpg)

Names the pages expect (rename to match yours, or edit the HTML):
- fitness-cover.jpg, hiking-cover.jpg            (home page)
- fitness-app-hero.jpg, hiking-app-hero.jpg      (top of each case study)
- fitness-app-research.jpg, hiking-app-research.jpg
- fitness-app-before.jpg, fitness-app-after.jpg
- hiking-app-before.jpg, hiking-app-after.jpg

Always add alt text that describes what the image shows.

"Beyond design" gallery on the home page:
- life-1.jpg to life-12.jpg
- Each photo has a data-tag (outside, music, making or people) that decides
  which filter button shows it. Change the tag in index.html to move a photo.
- Photos marked data-size="tall" suit portrait shots; data-size="wide" suits landscape.
- To add more, copy a whole <li class="gallery__item"> … </li> block.
  Tip: the grid ends flush when (number of photos + tall photos + wide photos)
  divides evenly by 4.
