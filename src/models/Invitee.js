import mongoose from "mongoose";

const { Schema, model } = mongoose;

const InviteeSchema = new Schema(
  {
    /**
     * Имя клиента. Обязательное всегда.
     */
    name: { type: String, required: true },

    /**
     * Email клиента. Nullable, unique sparse.
     * null если бизнес работает только с телефоном.
     */
    email: { type: String, unique: true, sparse: true, default: null },

    /**
     * E.164 формат: "+380501234567". Nullable, unique sparse.
     * Стандарт: + код_страны + номер, только цифры.
     * Все SMS-сервисы ожидают именно этот формат.
     */
    phone: { type: String, unique: true, sparse: true, default: null },

    /**
     * ISO 3166-1 ("UA"). Nullable.
     * Сохраняем для предзаполнения флага страны
     * при следующем бронировании этого клиента.
     */
    phoneCountry: { type: String, default: null },

    /**
     * IANA timezone. Определяется из браузера при первом бронировании.
     * Используется для показа времени в письмах клиенту.
     */
    timezone: { type: String },

    /**
     * Nullable.
     * null = обычный клиент без аккаунта специалиста.
     * Заполняется если специалист сам записывается к кому-то.
     */
    userId: { type: Schema.Types.ObjectId, ref: "User", default: null },
  },
  { timestamps: true },
);

export default model("Invitee", InviteeSchema);
