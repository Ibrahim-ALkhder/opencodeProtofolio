import { useState, useEffect } from "react";
import { apiGetProjects, apiGetCertificates, apiGetCv } from "./api";
import { projects as staticProjects, certificates as staticCertificates } from "./data";

const cache = { projects: null, certificates: null, cv: null };
const pending = {};

function cachedFetch(key, fetcher, staticFallback) {
  if (cache[key]) return Promise.resolve(cache[key]);

  if (!pending[key]) {
    pending[key] = fetcher()
      .then((data) => {
        if (data === null || data === undefined) {
          cache[key] = staticFallback;
        } else {
          cache[key] = data;
        }
        return cache[key];
      })
      .finally(() => { delete pending[key]; });
  }

  return pending[key];
}

export function useProjects() {
  const [data, setData] = useState(cache.projects || []);
  const [loading, setLoading] = useState(!cache.projects);

  useEffect(() => {
    if (cache.projects) return;
    cachedFetch(
      "projects",
      () => apiGetProjects(100, 0).then(r => r ? r.projects : null),
      staticProjects
    ).then(setData).finally(() => setLoading(false));
  }, []);

  return { projects: data, loading };
}

export function useCertificates() {
  const [data, setData] = useState(cache.certificates || []);
  const [loading, setLoading] = useState(!cache.certificates);

  useEffect(() => {
    if (cache.certificates) return;
    cachedFetch(
      "certificates",
      () => apiGetCertificates(100, 0).then(r => r ? r.certificates : null),
      staticCertificates
    ).then(setData).finally(() => setLoading(false));
  }, []);

  return { certificates: data, loading };
}

export function useCvUrl() {
  const [url, setUrl] = useState(cache.cv || "/Ibrahim-CV.pdf");

  useEffect(() => {
    if (cache.cv) return;

    if (!pending.cv) {
      pending.cv = apiGetCv()
        .then((data) => {
          const u = data?.url || "/Ibrahim-CV.pdf";
          cache.cv = u;
          return u;
        })
        .finally(() => { delete pending.cv; });
    }

    pending.cv.then(setUrl);
  }, []);

  return url;
}
