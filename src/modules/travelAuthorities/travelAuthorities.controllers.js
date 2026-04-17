const travelAuthoritiesService = require("./travelAuthorities.services");

class TravelAuthoritiesController {
    async getAll(req, res) {
        try {
            const authorities = await travelAuthoritiesService.getAllAuthorities();
            res.status(200).json(authorities);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }

    async getById(req, res) {
        try {
            const authority = await travelAuthoritiesService.getAuthorityById(req.params.id);
            res.status(200).json(authority);
        } catch (error) {
            res.status(404).json({ message: error.message });
        }
    }

    async create(req, res) {
        try {
            const authority = await travelAuthoritiesService.createAuthority(req.body);
            res.status(201).json({ message: "Travel Authority created successfully", authority });
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    }

    async update(req, res) {
        try {
            const authority = await travelAuthoritiesService.updateAuthority(req.params.id, req.body);
            res.status(200).json({ message: "Travel Authority updated successfully", authority });
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    }

    async remove(req, res) {
        try {
            await travelAuthoritiesService.deleteAuthority(req.params.id);
            res.status(200).json({ message: "Travel Authority deleted successfully" });
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    }
}

module.exports = new TravelAuthoritiesController();
