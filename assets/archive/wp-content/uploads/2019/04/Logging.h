#pragma once
#pragma region LOGGING
#define LOG(a) Serial.println(a)
#define LOG1(a) Serial.println(a)
#define LOG2(a, b) { Serial.print(a); Serial.print(","); Serial.println(b); }
#define LOG3(a, b, c) { Serial.print(a); Serial.print(","); Serial.print(b); Serial.print(","); Serial.println(c); }
#define LOG4(a, b, c, d) { Serial.print(a); Serial.print(","); Serial.print(b); Serial.print(","); Serial.print(c); Serial.print(","); Serial.println(d); }
#pragma endregion
