// Skema tabel Drizzle. Migrasinya dibuat dengan `npm run db:generate`.
import { sql } from "drizzle-orm";
import { boolean, integer, pgEnum, pgTable, text, timestamp, uuid, varchar } from "drizzle-orm/pg-core";
import { KEHADIRAN, PANJANG_MAKS_NAMA, PANJANG_MAKS_UCAPAN } from "../buku-tamu/rsvp";

export const kehadiran = pgEnum("kehadiran", KEHADIRAN);

/** RSVP Tamu. Ucapan bukan tabel sendiri: Ucapan adalah RSVP yang kolom ucapannya terisi dan tidak tersembunyi. */
export const rsvp = pgTable("rsvp", {
  id: uuid("id").primaryKey().defaultRandom(),
  nama: varchar("nama", { length: PANJANG_MAKS_NAMA }).notNull(),
  kehadiran: kehadiran("kehadiran").notNull(),
  /** Id Acara dari Konten Undangan. Kosong bila tidak hadir. */
  idAcara: text("id_acara").array().notNull().default(sql`'{}'`),
  /** Jumlah orang. 0 bila tidak hadir. */
  pax: integer("pax").notNull(),
  ucapan: varchar("ucapan", { length: PANJANG_MAKS_UCAPAN }),
  /** Ucapan disembunyikan Mempelai; kehadirannya tetap dihitung. */
  tersembunyi: boolean("tersembunyi").notNull().default(false),
  dibuat: timestamp("dibuat", { withTimezone: true }).notNull().defaultNow(),
});
