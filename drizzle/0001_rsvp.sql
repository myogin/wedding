CREATE TYPE "public"."kehadiran" AS ENUM('hadir', 'tidak_hadir');--> statement-breakpoint
CREATE TABLE "rsvp" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"nama" varchar(100) NOT NULL,
	"kehadiran" "kehadiran" NOT NULL,
	"id_acara" text[] DEFAULT '{}' NOT NULL,
	"pax" integer NOT NULL,
	"ucapan" varchar(500),
	"tersembunyi" boolean DEFAULT false NOT NULL,
	"dibuat" timestamp with time zone DEFAULT now() NOT NULL
);
