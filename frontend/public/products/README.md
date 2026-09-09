# Product photography

One folder per product, named after its slug. Drop image files in and attach
them with the backend script:

```bash
cd backend
npm run set-images -- --slug atolis --files bottle.jpg,carton.jpg,detail.jpg
```

The script writes `/products/<slug>/<file>` paths onto the product, so the
storefront gallery, cards, search results and cart all pick them up. The first
file listed is the one used wherever a single image is shown.

Guidance:
- Square (1:1) or portrait 4:5, at least 1200px on the short edge.
- The first image should be the bottle on a plain ground — it is the one that
  appears in grids and the bag.
- Keep each file under ~500KB; export as JPEG at ~80% quality.

Only use photography attume owns. Images of another brand's bottle would
misrepresent what the customer receives.
