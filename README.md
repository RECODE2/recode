# RECODE

RECODE is a web-based Revision Control System for Digital Images. It is an extension of Minipaint, a online image editor developed by Viliusle (https://github.com/viliusle/miniPaint).
No need to buy, download, install or have obsolete flash. No ads.
Key features: layers, filters, HTML5, open source, photoshop alternative.

RECODE operates directly in the browser. You can create images, paste from clipboard (ctrl+v) 
or upload from computer (using menu or drag & drop). Nothing will be sent to any server. Everything stays in your browser. 

## DOCKER Instructions:
You can use RECODE (Docker) in this way:
```
sudo apt install docker docker-compose
git clone https://github.com/saso93/recode.git
cd recode/docker
sudo docker-compose up
```
Then you can use it on: http://localhost:8081/

## Preview:
Not available yet.

## Browser Support
- Chrome
- Firefox
- Opera
- Edge
- Safari
- IE 11 (only basic support)

## Features

- **Files**: open images, directories, URL, drag and drop, save (PNG, JPG, BMP, WEBP, animated GIF, JSON (layers data), print.
- **Edit**: Undo, cut, copy, paste, selection, paste from clipboard.
- **Image**: information, EXIF, trim, zoom, resize (Hermite resample, default resize), rotate, flip, color corrections (brightness, contrast, hue, saturation, luminance), auto adjust colors, grid, histogram, negative.
- **Layers**: multiple layers system, differences, merge, flatten, Transparency support.
- **Effects**: Black and White, Blur (box, Gaussian, stack, zoom), Bulge/Pinch, Denoise, Desaturate, Dither, Dot Screen, Edge, Emboss, Enrich, Gamma, Grains, GrayScale, Heatmap, JPG Compression, Mosaic, Oil, Sepia, Sharpen, Solarize, Tilt Shift, Vignette, Vibrance, Vintage,
- **Tools**: pencil, brush, magic wand, erase, fill, color picker, letters, crop, blur, sharpen, desaturate, clone, borders, sprites, key-points, color to alpha, color zoom, replace color, restore alpha, content fill.
- **Help**: keyboard shortcuts, translations.
- **Repository**: create repository, clone repository, invite and delete user.
- **VCS Operations**: revision graph, add revision, commit, merge.
- **User**: sign-in, sign-up, edit personal data.


## Build instructions
You can use RECODE (local machine) in this way:
```
git clone https://github.com/saso93/recode.git
cd recode
npm install
npm run build
npm run start
```
Then you can use it on: http://localhost:8081/

## Wiki
See [Wiki](https://github.com/saso93/recode/wiki)

## User Stories

### Index:
![recode index](./User_Stories/index.png?raw=true)

### Create repository:
![recode crea repo](./User_Stories/Crea_repo.png?raw=true)

### Revision graph:
![recode revision graph](./User_Stories/Revision_Graph.png?raw=true)

### Add revision:
![add revision](./User_Stories/Add%20Revision.png?raw=true)

### Merge:
![recode merge](./User_Stories/Merge.png?raw=true)

### Conflict resolution:
![recode conflict resolution](./User_Stories/Conflict.png?raw=true)


## License
MIT License

## Support
Please use the GitHub issues for support, features, issues or use this mails for contacts:
- salvatore.vestita.1993@gmail.com
- gabriele.neglia.1994@gmail.com
- mantellini.davide1995@gmail.com