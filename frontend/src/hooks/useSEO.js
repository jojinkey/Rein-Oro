import { useEffect } from 'react';

export default function useSEO({ title, description, image, path }) {
  useEffect(() => {
    // 1. Title
    if (title) {
      document.title = title;
      setMetaTag('property', 'og:title', title);
    }

    // 2. Description
    if (description) {
      setMetaTag('name', 'description', description);
      setMetaTag('property', 'og:description', description);
    }

    // 3. Image
    if (image) {
      const fullImageUrl = image.startsWith('http') ? image : window.location.origin + '/' + image;
      setMetaTag('property', 'og:image', fullImageUrl);
    }

    // 4. Canonical Link
    const canonicalUrl = `https://reinoro.com/#${path || ''}`;
    let canonicalLink = document.querySelector('link[rel="canonical"]');
    if (!canonicalLink) {
      canonicalLink = document.createElement('link');
      canonicalLink.rel = 'canonical';
      document.head.appendChild(canonicalLink);
    }
    canonicalLink.href = canonicalUrl;
  }, [title, description, image, path]);
}

function setMetaTag(attr, name, content) {
  let el = document.querySelector(`meta[${attr}="${name}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, name);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}
