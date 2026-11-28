import mongoose from 'mongoose';

const roleSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
            lowercase: true,
            unique: true
        },
        description: {
            type: String,
            trim: true,
            default: ''
        }
    },
    {
        timestamps: true,
        collection: 'roles'
    }
);

const Role = mongoose.models.Role || mongoose.model('Role', roleSchema);

export default Role;