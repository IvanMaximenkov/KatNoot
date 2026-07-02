"use client";

import { useEffect, useState } from "react";
import { normalizeInfrastructureGeoJson } from "@/lib/map/normalizeInfrastructure";
import type { InfrastructureLayerKey, NormalizedInfrastructureFeature } from "@/types/map";

type InfrastructureState = {
  bikeLanes: NormalizedInfrastructureFeature[];
  aLanes: NormalizedInfrastructureFeature[];
  isLoading: boolean;
  error: string | null;
  unavailableLayers: InfrastructureLayerKey[];
};

type LoadedInfrastructure = Omit<InfrastructureState, "isLoading">;

const INFRASTRUCTURE_URLS = {
  bikeLanes: "/data/map/moscow/bike_lanes.geojson",
  aLanes: "/data/map/moscow/a_lanes.geojson"
} as const;

let cachedInfrastructure: LoadedInfrastructure | null = null;
let infrastructurePromise: Promise<LoadedInfrastructure> | null = null;

async function loadSource(layer: InfrastructureLayerKey) {
  const response = await fetch(INFRASTRUCTURE_URLS[layer]);
  if (!response.ok) {
    throw new Error(`${layer}: ${response.status}`);
  }

  const json = await response.json();
  const features = normalizeInfrastructureGeoJson(json, layer === "bikeLanes" ? "bike_lane" : "a_lane");
  if (features.length === 0) {
    throw new Error(`${layer}: empty`);
  }

  return features;
}

async function loadInfrastructure(): Promise<LoadedInfrastructure> {
  if (cachedInfrastructure) return cachedInfrastructure;
  if (infrastructurePromise) return infrastructurePromise;

  infrastructurePromise = Promise.allSettled([loadSource("bikeLanes"), loadSource("aLanes")]).then((results) => {
    const [bikeResult, aLaneResult] = results;
    const unavailableLayers: InfrastructureLayerKey[] = [];
    const errors: string[] = [];

    if (bikeResult.status === "rejected") {
      unavailableLayers.push("bikeLanes");
      errors.push("велодорожки не загрузились");
    }

    if (aLaneResult.status === "rejected") {
      unavailableLayers.push("aLanes");
      errors.push("А-полосы не загрузились");
    }

    const loaded = {
      bikeLanes: bikeResult.status === "fulfilled" ? bikeResult.value : [],
      aLanes: aLaneResult.status === "fulfilled" ? aLaneResult.value : [],
      error: errors.length ? errors.join(", ") : null,
      unavailableLayers
    };

    cachedInfrastructure = loaded;
    return loaded;
  });

  return infrastructurePromise;
}

export function useCyclingInfrastructure(): InfrastructureState {
  const [state, setState] = useState<InfrastructureState>(() => ({
    bikeLanes: cachedInfrastructure?.bikeLanes ?? [],
    aLanes: cachedInfrastructure?.aLanes ?? [],
    error: cachedInfrastructure?.error ?? null,
    unavailableLayers: cachedInfrastructure?.unavailableLayers ?? [],
    isLoading: !cachedInfrastructure
  }));

  useEffect(() => {
    let cancelled = false;

    loadInfrastructure()
      .then((loaded) => {
        if (!cancelled) {
          setState({ ...loaded, isLoading: false });
        }
      })
      .catch(() => {
        if (!cancelled) {
          setState({
            bikeLanes: [],
            aLanes: [],
            error: "Велослои не загрузились",
            unavailableLayers: ["bikeLanes", "aLanes"],
            isLoading: false
          });
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return state;
}
