import { u as useRuntimeConfig, h as getHeader, i as getCookie } from './nitro.mjs';
import jwt from 'jsonwebtoken';
import { U as User } from './User.mjs';

const config = useRuntimeConfig();
const generateAuthToken = (userId, role, organizationId) => {
  return jwt.sign({ userId, role, organizationId }, config.jwtSecret, { expiresIn: "1h" });
};
const verifyAuthToken = (token) => {
  try {
    return jwt.verify(token, config.jwtSecret);
  } catch (error) {
    return null;
  }
};
const getUserFromEvent = async (event) => {
  var _a, _b;
  const authHeader = getHeader(event, "Authorization");
  const token = (authHeader == null ? void 0 : authHeader.startsWith("Bearer ")) ? authHeader.split(" ")[1] : getCookie(event, "auth_token");
  if (!token) {
    return null;
  }
  const decoded = verifyAuthToken(token);
  if (!decoded || typeof decoded === "string") {
    return null;
  }
  const user = await User.findById(decoded.userId).populate("organizationId");
  if (!user) {
    return null;
  }
  return {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    role: user.role,
    organizationId: ((_b = (_a = user.organizationId) == null ? void 0 : _a._id) == null ? void 0 : _b.toString()) || null
  };
};

export { getUserFromEvent as a, generateAuthToken as g };
//# sourceMappingURL=auth.mjs.map
