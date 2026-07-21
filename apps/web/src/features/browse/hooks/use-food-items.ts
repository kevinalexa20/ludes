import { useState, useEffect } from "react";
import { FoodItem } from "@ludes/shared";
import { api, ApiError } from "@/lib/api-client";

export type FoodItemsState =
  | { readonly status: "idle" }
  | { readonly status: "loading"; readonly data?: FoodItem[] }
  | { readonly status: "success"; readonly data: FoodItem[]; readonly total: number }
  | { readonly status: "error"; readonly error: ApiError };

export type FoodItemDetailState =
  | { readonly status: "idle" }
  | { readonly status: "loading" }
  | { readonly status: "success"; readonly data: FoodItem }
  | { readonly status: "error"; readonly error: ApiError };

interface FetchFoodItemsParams {
  category?: string;
  sort?: string;
  limit?: number;
  offset?: number;
  lat?: number;
  lng?: number;
  search?: string;
}

export const useFoodItems = (params: FetchFoodItemsParams) => {
  const [state, setState] = useState<FoodItemsState>({ status: "idle" });

  useEffect(() => {
    let isMounted = true;
    setState((prev) => {
      if (prev.status === "success") {
        return { status: "loading", data: prev.data };
      }
      return { status: "loading" };
    });

    const fetchData = async () => {
      try {
        const queryParams = new URLSearchParams();
        if (params.category && params.category !== "Semua") {
          queryParams.set("category", params.category.toLowerCase());
        }
        if (params.sort) {
          queryParams.set("sort", params.sort);
        }
        if (params.limit !== undefined) {
          queryParams.set("limit", params.limit.toString());
        }
        if (params.offset !== undefined) {
          queryParams.set("offset", params.offset.toString());
        }
        if (params.lat !== undefined) {
          queryParams.set("lat", params.lat.toString());
        }
        if (params.lng !== undefined) {
          queryParams.set("lng", params.lng.toString());
        }
        if (params.search) {
          queryParams.set("search", params.search);
        }

        const queryString = queryParams.toString();
        const url = `/food${queryString ? `?${queryString}` : ""}`;
        
        const response = await api.get<{ data: FoodItem[]; total: number }>(url);
        
        if (isMounted) {
          setState({
            status: "success",
            data: response.data,
            total: response.total || response.data.length,
          });
        }
      } catch (err) {
        if (isMounted) {
          setState({
            status: "error",
            error: err instanceof ApiError ? err : new ApiError("Gagal memuat makanan", 500),
          });
        }
      }
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  }, [
    params.category,
    params.sort,
    params.limit,
    params.offset,
    params.lat,
    params.lng,
    params.search,
  ]);

  return state;
};

export const useFoodItemById = (id: string) => {
  const [state, setState] = useState<FoodItemDetailState>({ status: "idle" });

  useEffect(() => {
    let isMounted = true;
    if (!id) return;

    setState({ status: "loading" });

    const fetchData = async () => {
      try {
        const response = await api.get<FoodItem>(`/food/${id}`);
        if (isMounted) {
          setState({
            status: "success",
            data: response,
          });
        }
      } catch (err) {
        if (isMounted) {
          setState({
            status: "error",
            error: err instanceof ApiError ? err : new ApiError("Gagal memuat detail makanan", 500),
          });
        }
      }
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  }, [id]);

  return state;
};
