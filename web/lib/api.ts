"use client";

import useSWR from "swr";
import axios from "axios";

const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL ?? process.env.API_BASE_URL ?? "http://localhost:8000";

const fetcher = async (url: string) => {
  const response = await axios.get(`${apiBase}${url}`);
  return response.data;
};

export function useApi<T>(path: string) {
  const { data, error, isLoading, mutate } = useSWR<T>(path, fetcher);
  return { data, error, isLoading, mutate };
}

export { apiBase };
