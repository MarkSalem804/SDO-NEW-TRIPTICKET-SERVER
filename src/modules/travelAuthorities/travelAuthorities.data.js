const prisma = require("../../utils/prisma");

class TravelAuthoritiesData {
    async getAllAuthorities() {
        return await prisma.travelAuthorities.findMany({
            orderBy: { createdAt: "desc" }
        });
    }

    async getFirstAuthority() {
        return await prisma.travelAuthorities.findFirst({
            where: { status: "Active" }
        });
    }

    async getAuthorityById(id) {
        return await prisma.travelAuthorities.findUnique({
            where: { id: parseInt(id) }
        });
    }

    async createAuthority(data) {
        return await prisma.travelAuthorities.create({ data });
    }

    async updateAuthority(id, data) {
        return await prisma.travelAuthorities.update({
            where: { id: parseInt(id) },
            data
        });
    }

    async deleteAuthority(id) {
        return await prisma.travelAuthorities.delete({
            where: { id: parseInt(id) }
        });
    }
}

module.exports = new TravelAuthoritiesData();
