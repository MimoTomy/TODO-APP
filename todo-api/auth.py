from datetime import datetime, timedelta  # used to set token expiry time
from jose import JWTError, jwt  # library to create and verify JWT tokens
from passlib.context import CryptContext  # library to hash and verify passwords

# Secret key used to sign the token - in production this should be a long random string hidden in .env
SECRET_KEY = "mysecretkey123"
# The algorithm used to sign the token - HS256 is the most common
ALGORITHM = "HS256"
# Token will expire after 30 minutes - after that the user needs to login again
ACCESS_TOKEN_EXPIRE_MINUTES = 30

# Tell passlib to use bcrypt for hashing passwords - bcrypt is the industry standard
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def hash_password(password: str):
    # Takes a plain password like "mypassword123" and returns a scrambled version
    # Example: "mypassword123" → "$2b$12$KIXabc..."
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str):
    # Checks if the plain password matches the hashed one
    # Returns True if they match, False if not
    return pwd_context.verify(plain_password, hashed_password)

def create_access_token(data: dict):
    to_encode = data.copy()  # copy the data so we don't modify the original
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)  # set expiry time to 30 mins from now
    to_encode.update({"exp": expire})  # add expiry time to the token data
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)  # create and return the JWT token string

def verify_token(token: str):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])  # decode the token and check it's valid
        return payload  # return the data inside the token (like username)
    except JWTError:
        return None  # if token is invalid or expired return None