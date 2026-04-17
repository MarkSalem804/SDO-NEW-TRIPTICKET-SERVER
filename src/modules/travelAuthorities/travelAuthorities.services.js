const travelAuthoritiesData = require("./travelAuthorities.data");

class TravelAuthoritiesService {
    async getAllAuthorities() {
        return await travelAuthoritiesData.getAllAuthorities();
    }

    async getAuthorityById(id) {
        const authority = await travelAuthoritiesData.getAuthorityById(id);
        if (!authority) throw new Error("Travel Authority not found");
        return authority;
    }

    async createAuthority(data) {
        if (!data.name) throw new Error("Name is required");
        return await travelAuthoritiesData.createAuthority({
            name: data.name,
            plantilla: data.plantilla || null,
            signaturePath: data.signaturePath || null,
            status: data.status || "Active",
        });
    }

    async updateAuthority(id, data) {
        await this.getAuthorityById(id); // ensure exists
        return await travelAuthoritiesData.updateAuthority(id, data);
    }

    async deleteAuthority(id) {
        await this.getAuthorityById(id); // ensure exists
        return await travelAuthoritiesData.deleteAuthority(id);
    }
}

module.exports = new TravelAuthoritiesService();
