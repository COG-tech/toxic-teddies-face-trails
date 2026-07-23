# Toxic Toby Completion and Private Feed

## Player flow

```text
Neutral cleared
→ expression reveal
→ Next Expression
→ Evil Grin
→ Gross
→ Angry
→ Maniacal Laugh
→ Toxic Toby completed
→ private Toxic Feed unlocked
```

Expressions 1–4 open the next expression directly. Expression 5 changes the primary completion action to `Enter Toxic Toby's Feed`.

## Completion artwork slots

The app supports five final reveal images without requiring them for feature development:

```text
assets/reveals/tt01/neutral.webp
assets/reveals/tt01/evil-grin.webp
assets/reveals/tt01/gross.webp
assets/reveals/tt01/angry.webp
assets/reveals/tt01/maniacal-laugh.webp
```

Until those files are approved, `src/content/reveal-manifest.json` leaves `image_src` as `null` and the app displays a clearly labeled CSS placeholder. Do not create substitute character artwork. When an approved file is ready, add it to the expected path and set that reveal's `image_src` to the same path.

## Private feed rules

- The feed is fictional authored content inside the app.
- Players cannot create accounts, post, message, upload, follow strangers or contact other players.
- The feed is locked until all five Toxic Toby expressions are complete.
- A direct `?feed=tt01` URL cannot bypass the completion requirement.
- Posts and replies come from `src/content/feed-manifest.json`.
- Opening a post records it as viewed locally.

## Save fields

```json
{
  "completed": {},
  "teddyCompletion": {"tt01": true},
  "feedUnlocks": {"tt01": true},
  "viewedFeedPosts": {"tt01": ["tt01-post-001"]},
  "activeSession": null
}
```

Exact unfinished puzzle paths continue to use `activeSession.removedPathIds`.

## Tests

`tests/progression.test.mjs` verifies:

- expression 1 advances to expression 2;
- expression 4 advances to expression 5;
- expression 5 unlocks the feed;
- replay does not erase completion;
- restart does not unlock the feed;
- direct feed access cannot bypass progression;
- viewed/unread feed state is stable.

`tests/save-store.test.mjs` verifies that Teddy completion, feed unlock and viewed post state survive normalization and writes.
