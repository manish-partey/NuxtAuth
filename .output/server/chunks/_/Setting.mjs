import mongoosePkg from 'mongoose';

const settingSchema = new mongoosePkg.Schema({
  key: { type: String, required: true, unique: true },
  value: { type: mongoosePkg.Schema.Types.Mixed, required: true }
});
const Setting = mongoosePkg.models.Setting || mongoosePkg.model("Setting", settingSchema);

export { Setting as S };
//# sourceMappingURL=Setting.mjs.map
