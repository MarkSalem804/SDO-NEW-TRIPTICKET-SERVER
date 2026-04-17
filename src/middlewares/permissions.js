const prisma = require("../utils/prisma")

async function hasRole(userId, roleName) {
    const roles = await prisma.userrole.findMany({
    where: { userId },
    include: { role: true }
    })
    return roles.some(r => r.role.name === roleName)
}

async function hasPermission(userId, permissionName) {
    const permissions = await prisma.userpermission.findMany({
    where: { userId },
    include: { permission: true }
    })
    return permissions.some(p => p.permission.name === permissionName)
}

function requireAdmin(req, res, next) {
    try {
    const roles = req.user?.roles || []
    if (!roles.includes("SYSTEM_ADMINISTRATOR")) {
        return res.status(403).json({ error: "Forbidden" })
    }
    next()
    } catch (err) {
    res.status(500).json({ error: "Server error" })
    }
}


async function getEffectivePermissions(userId) {
  // Direct user permissions
    const userPermissions = await prisma.userpermission.findMany({
    where: { userId },
    include: { permission: true }
    })

  // Role-based permissions
    const userRoles = await prisma.userrole.findMany({
    where: { userId },
    include: { role: { include: { rolepermission: { include: { permission: true } } } } }
    })

    const rolePermissions = userRoles.flatMap(ur =>
    ur.role.rolepermission.map(rp => rp.permission)
    )

  // Merge and deduplicate
    const allPermissions = [
    ...userPermissions.map(up => up.permission),
    ...rolePermissions
    ]

    return Array.from(new Map(allPermissions.map(p => [p.name, p])).values())
}

async function requireSelfOrAdmin(req, res, next) {
    try {
    const requesterId = req.user?.id
    const targetUserId = req.params.userId

    if (!requesterId) return res.status(401).json({ error: "Unauthorized" })

    const isAdmin = await hasRole(requesterId, "SYSTEM_ADMINISTRATOR")

    if (isAdmin || requesterId === targetUserId) {
        return next()
    }

    return res.status(403).json({ error: "Forbidden" })
    } catch (err) {
    res.status(500).json({ error: "Server error" })
    }
}

function requirePermission(permissionName) {
    return async (req, res, next) => {
    try {
        const userId = req.user?.id
        if (!userId) return res.status(401).json({ error: "Unauthorized" })

        const effectivePermissions = await getEffectivePermissions(userId)
        const allowed = effectivePermissions.some(p => p.name === permissionName)

        if (!allowed) return res.status(403).json({ error: "Forbidden" })
        next()
    } catch (err) {
        res.status(500).json({ error: "Server error" })
    }
    }
}

function requireSelfOrAdminOrPermission(permissionName) {
    return async (req, res, next) => {
    try {
        const requesterId = req.user?.id
        const targetUserId = req.params.userId
        const roles = req.user?.roles || []
        const permissions = req.user?.permissions || []

        if (!requesterId) return res.status(401).json({ error: "Unauthorized" })

        const isAdmin = roles.includes("SYSTEM_ADMINISTRATOR")
        const isSelf = requesterId === targetUserId
        const hasPermission = permissions.includes(permissionName)

        // Allow if admin, or self, or has the required permission
        if (isAdmin || isSelf || hasPermission) {
            return next()
        }

        return res.status(403).json({ error: "Forbidden" })
    } catch (err) {
        res.status(500).json({ error: "Server error" })
    }
    }
}

function requireAdminOrPermission(permissionName) {
    return (req, res, next) => {
    try {
        const roles = req.user?.roles || []
        const permissions = req.user?.permissions || []

        const isAdmin = roles.includes("SYSTEM_ADMINISTRATOR")
        const hasPermission = permissions.includes(permissionName)

        if (isAdmin || hasPermission) {
        return next()
        }

        return res.status(403).json({ error: "Forbidden" })
    } catch (err) {
        res.status(500).json({ error: "Server error" })
    }
    }
}

module.exports = {
    hasRole,
    hasPermission,
    requireAdmin,
    requirePermission,
    getEffectivePermissions,
    requireSelfOrAdmin,
    requireSelfOrAdminOrPermission,
    requireAdminOrPermission
}
