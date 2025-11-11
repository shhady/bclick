'use client';
import useSWR from 'swr';

const fetcher = async (url) => {
  const res = await fetch(url, { credentials: 'include' });
  const text = await res.text();
  let data = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = null;
  }
  if (!res.ok) {
    const message = data?.error || `Request failed (${res.status})`;
    throw new Error(message);
  }
  return data;
};

export function useMe() {
  const { data, error, isLoading, mutate } = useSWR('/api/users/me', fetcher, {
    revalidateOnFocus: false,
  });
  return { me: data, isLoading, error, mutate };
}


