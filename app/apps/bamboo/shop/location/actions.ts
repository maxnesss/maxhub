"use server";

import { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { requireAppEdit } from "@/lib/authz";
import { prisma } from "@/prisma";

const LOCATION_REDIRECT_BASE = "/apps/bamboo/shop/location";

const locationSchema = z.object({
  name: z.string().trim().min(2).max(120),
  notes: z.string().trim().min(0).max(1200),
});

const locationUpdateSchema = locationSchema.extend({
  id: z.string().trim().min(1),
});

const deleteSchema = z.object({
  id: z.string().trim().min(1),
});

const rentalPlaceSchema = z.object({
  foundAt: z.string().trim().min(1),
  price: z.string().trim().min(1).max(120),
  location: z.string().trim().min(2).max(160),
  link: z.string().trim().min(5).max(400),
  notes: z.string().trim().min(0).max(1200),
});

const rentalPlaceUpdateSchema = rentalPlaceSchema.extend({
  id: z.string().trim().min(1),
});

const websiteSchema = z.object({
  name: z.string().trim().min(2).max(120),
  url: z.string().trim().min(5).max(400),
  notes: z.string().trim().min(0).max(1200),
});

const websiteUpdateSchema = websiteSchema.extend({
  id: z.string().trim().min(1),
});

function toDateOrFail(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    throw new Error("Invalid date");
  }

  return date;
}

function normalize(value: string) {
  return value.trim().toLocaleLowerCase();
}

function normalizeUrl(value: string) {
  const trimmed = value.trim();
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    return trimmed;
  }

  return `https://${trimmed}`;
}

function fail(message: string) {
  redirect(`${LOCATION_REDIRECT_BASE}?error=${message}`);
}

function ok(message: string) {
  revalidatePath(LOCATION_REDIRECT_BASE);
  redirect(`${LOCATION_REDIRECT_BASE}?saved=${message}`);
}

export async function addShopLocationAction(formData: FormData) {
  await requireAppEdit("BAMBOO");

  const parsed = locationSchema.safeParse({
    name: formData.get("name"),
    notes: formData.get("notes") || "",
  });

  if (!parsed.success) {
    fail("invalid");
  }

  try {
    await prisma.bambooShopLocation.create({
      data: {
        name: parsed.data.name,
        normalizedName: normalize(parsed.data.name),
        notes: parsed.data.notes,
      },
    });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      fail("duplicate-location");
    }

    throw error;
  }

  ok("location-added");
}

export async function updateShopLocationAction(formData: FormData) {
  await requireAppEdit("BAMBOO");

  const parsed = locationUpdateSchema.safeParse({
    id: formData.get("id"),
    name: formData.get("name"),
    notes: formData.get("notes") || "",
  });

  if (!parsed.success) {
    fail("invalid");
  }

  try {
    await prisma.bambooShopLocation.update({
      where: { id: parsed.data.id },
      data: {
        name: parsed.data.name,
        normalizedName: normalize(parsed.data.name),
        notes: parsed.data.notes,
      },
    });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      fail("duplicate-location");
    }

    throw error;
  }

  ok("location-updated");
}

export async function deleteShopLocationAction(formData: FormData) {
  await requireAppEdit("BAMBOO");

  const parsed = deleteSchema.safeParse({
    id: formData.get("id"),
  });

  if (!parsed.success) {
    fail("invalid");
  }

  await prisma.bambooShopLocation.delete({
    where: { id: parsed.data.id },
  });

  ok("location-removed");
}

export async function addShopRentalPlaceAction(formData: FormData) {
  await requireAppEdit("BAMBOO");

  const parsed = rentalPlaceSchema.safeParse({
    foundAt: formData.get("foundAt"),
    price: formData.get("price"),
    location: formData.get("location"),
    link: formData.get("link"),
    notes: formData.get("notes") || "",
  });

  if (!parsed.success) {
    fail("invalid");
  }

  await prisma.bambooShopRentalPlace.create({
    data: {
      foundAt: toDateOrFail(parsed.data.foundAt),
      price: parsed.data.price,
      location: parsed.data.location,
      link: normalizeUrl(parsed.data.link),
      notes: parsed.data.notes,
    },
  });

  ok("place-added");
}

export async function updateShopRentalPlaceAction(formData: FormData) {
  await requireAppEdit("BAMBOO");

  const parsed = rentalPlaceUpdateSchema.safeParse({
    id: formData.get("id"),
    foundAt: formData.get("foundAt"),
    price: formData.get("price"),
    location: formData.get("location"),
    link: formData.get("link"),
    notes: formData.get("notes") || "",
  });

  if (!parsed.success) {
    fail("invalid");
  }

  await prisma.bambooShopRentalPlace.update({
    where: { id: parsed.data.id },
    data: {
      foundAt: toDateOrFail(parsed.data.foundAt),
      price: parsed.data.price,
      location: parsed.data.location,
      link: normalizeUrl(parsed.data.link),
      notes: parsed.data.notes,
    },
  });

  ok("place-updated");
}

export async function deleteShopRentalPlaceAction(formData: FormData) {
  await requireAppEdit("BAMBOO");

  const parsed = deleteSchema.safeParse({
    id: formData.get("id"),
  });

  if (!parsed.success) {
    fail("invalid");
  }

  await prisma.bambooShopRentalPlace.delete({
    where: { id: parsed.data.id },
  });

  ok("place-removed");
}

export async function addShopWebsiteAction(formData: FormData) {
  await requireAppEdit("BAMBOO");

  const parsed = websiteSchema.safeParse({
    name: formData.get("name"),
    url: formData.get("url"),
    notes: formData.get("notes") || "",
  });

  if (!parsed.success) {
    fail("invalid");
  }

  try {
    await prisma.bambooShopWebsite.create({
      data: {
        name: parsed.data.name,
        url: normalizeUrl(parsed.data.url),
        notes: parsed.data.notes,
      },
    });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      fail("duplicate-website");
    }

    throw error;
  }

  ok("website-added");
}

export async function updateShopWebsiteAction(formData: FormData) {
  await requireAppEdit("BAMBOO");

  const parsed = websiteUpdateSchema.safeParse({
    id: formData.get("id"),
    name: formData.get("name"),
    url: formData.get("url"),
    notes: formData.get("notes") || "",
  });

  if (!parsed.success) {
    fail("invalid");
  }

  try {
    await prisma.bambooShopWebsite.update({
      where: { id: parsed.data.id },
      data: {
        name: parsed.data.name,
        url: normalizeUrl(parsed.data.url),
        notes: parsed.data.notes,
      },
    });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      fail("duplicate-website");
    }

    throw error;
  }

  ok("website-updated");
}

export async function deleteShopWebsiteAction(formData: FormData) {
  await requireAppEdit("BAMBOO");

  const parsed = deleteSchema.safeParse({
    id: formData.get("id"),
  });

  if (!parsed.success) {
    fail("invalid");
  }

  await prisma.bambooShopWebsite.delete({
    where: { id: parsed.data.id },
  });

  ok("website-removed");
}
