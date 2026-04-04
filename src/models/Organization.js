import mongoose from "mongoose";

const { Schema, model } = mongoose;

const OrganizationSchema = new Schema(
  {
    /**
     * Отображаемое название организации.
     */
    name: { type: String, required: true },

    /**
     * Валюта организации.
     */
    currency: { type: String, enum: ["UAH", "USD"], default: "UAH" },

    /**
     * Описание организации (публичное).
     */
    description: { type: String, default: null },

    /**
     * Адрес организации.
     */
    address: { type: String, default: null },

    /**
     * Контактный телефон.
     */
    phone: { type: String, default: null },

    /**
     * Вебсайт организации.
     */
    website: { type: String, default: null },

    settings: {
      /**
       * IANA timezone ("Europe/Kyiv").
       * Дефолт для новых сотрудников и для движка слотов
       * когда у специалиста нет своего шаблона расписания.
       */
      defaultTimezone: { type: String, default: "Europe/Kyiv" },

      /**
       * ISO 3166-1 ("UA").
       * Дефолтный код страны в телефонном инпуте на странице записи клиента.
       */
      defaultCountry: { type: String, default: "UA" },

      /**
       * HEX. Цвет бренда на публичной странице записи.
       */
      brandColor: { type: String },

      /**
       * URL логотипа организации.
       */
      logoUrl: { type: String },

      /**
       * Скрыть "Powered by Slotix" на публичной странице.
       */
      hideBranding: { type: Boolean, default: false },
    },
  },
  { timestamps: true },
);

export default model("Organization", OrganizationSchema);
