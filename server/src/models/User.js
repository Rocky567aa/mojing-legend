const mongoose = require('mongoose')

const CrystalSchema = new mongoose.Schema({
  id: String,
  grade: { type: String, enum: ['green', 'blue', 'purple', 'gold', 'red', 'rainbow'] },
  element: { type: String, enum: ['fire', 'ice', 'thunder', 'dark', 'holy', 'chaos'] },
  level: { type: Number, default: 1, min: 1, max: 20 },
  corrupted: { type: Boolean, default: false },
  sideEffects: [String]
})

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  passwordHash: String,
  profession: {
    type: { type: String, enum: ['warrior', 'mage_frost', 'assassin', 'warlock', 'paladin', 'alchemist'] },
    chosenAt: Date,
    locked: { type: Boolean, default: true }
  },
  base: {
    level: { type: Number, default: 1, min: 1, max: 5 },
    machines: [String]
  },
  crystals: [CrystalSchema],
  inventory: {
    ores: { type: Map, of: Number, default: {} },
    powders: { type: Map, of: Number, default: {} },
    purifiedPowders: { type: Map, of: Number, default: {} },
    purifier: { type: Number, default: 5 },
    fuel: { type: Number, default: 10 }
  },
  stats: {
    totalCrystalsForged: { type: Number, default: 0 },
    highestGrade: { type: String, default: 'none' },
    sideEffectsTriggered: { type: Number, default: 0 }
  },
  createdAt: { type: Date, default: Date.now }
}, { timestamps: true })

module.exports = mongoose.model('User', UserSchema)
