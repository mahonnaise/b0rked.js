# b0rked.js

*b0rked.js* is not a full-blown W3C-like validator.

Its purpose is to verify if an (X)HTML document or fragment is at least somewhat
well-formed. It doesn't care about attributes, values, tag names, or the
position of tags. It only takes a closer look at the tags. It checks if they are
nested correctly and if those tags, which look like void tags, are indeed void
tags.

It's intended to be used for on-the-fly validation during devlopment. This can
be done by putting it between the rendering of the template(s) and the point
where this new fragment is injected into the DOM.

It's meant to catch all issues which are slightly harder to spot and which
happen frequently during development.

Performance is pretty good since it doesn't do all that much. On an anverage
office machine, validating 100kB of markup takes less than 20 msecs.