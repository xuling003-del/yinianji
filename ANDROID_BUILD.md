# Android 打包指南

## 📱 使用 Capacitor 打包 Android 应用

### 前置要求

1. **安装 Node.js** (已安装)
2. **安装 Android Studio**
   - 下载地址: https://developer.android.com/studio
   - 安装 Android SDK (API 33 或更高)
   - 配置 ANDROID_HOME 环境变量

3. **安装 Java JDK 17**
   - 下载地址: https://www.oracle.com/java/technologies/downloads/
   - 配置 JAVA_HOME 环境变量

### 步骤 1: 安装依赖

```bash
npm install
```

### 步骤 2: 初始化 Capacitor (首次)

```bash
npx cap init
```

按提示输入:
- App name: 奇幻学习岛
- App ID: com.studyisland.app
- Web asset directory: dist

### 步骤 3: 添加 Android 平台

```bash
npx cap add android
```

### 步骤 4: 构建 Web 应用

```bash
npm run build
```

### 步骤 5: 同步到 Android

```bash
npx cap sync android
```

### 步骤 6: 打开 Android Studio

```bash
npx cap open android
```

### 步骤 7: 在 Android Studio 中构建 APK

1. 等待 Gradle 同步完成
2. 点击菜单: Build → Build Bundle(s) / APK(s) → Build APK(s)
3. 等待构建完成
4. APK 位置: `android/app/build/outputs/apk/debug/app-debug.apk`

### 快捷命令

```bash
# 一键构建并打开 Android Studio
npm run android

# 只构建和同步，不打开 Android Studio
npm run android:build
```

## 🔧 配置说明

### 修改应用信息

编辑 `android/app/src/main/res/values/strings.xml`:
```xml
<string name="app_name">奇幻学习岛</string>
```

### 修改应用图标

替换以下目录中的图标:
- `android/app/src/main/res/mipmap-hdpi/ic_launcher.png`
- `android/app/src/main/res/mipmap-mdpi/ic_launcher.png`
- `android/app/src/main/res/mipmap-xhdpi/ic_launcher.png`
- `android/app/src/main/res/mipmap-xxhdpi/ic_launcher.png`
- `android/app/src/main/res/mipmap-xxxhdpi/ic_launcher.png`

### 修改应用包名

编辑 `android/app/build.gradle`:
```gradle
android {
    namespace "com.studyisland.app"
    defaultConfig {
        applicationId "com.studyisland.app"
        ...
    }
}
```

## 📦 生成签名 APK (发布版本)

### 1. 生成密钥库

```bash
keytool -genkey -v -keystore my-release-key.keystore -alias my-key-alias -keyalg RSA -keysize 2048 -validity 10000
```

### 2. 配置签名

编辑 `android/app/build.gradle`:
```gradle
android {
    signingConfigs {
        release {
            storeFile file('my-release-key.keystore')
            storePassword 'your-password'
            keyAlias 'my-key-alias'
            keyPassword 'your-password'
        }
    }
    buildTypes {
        release {
            signingConfig signingConfigs.release
            minifyEnabled false
            proguardFiles getDefaultProguardFile('proguard-android.txt'), 'proguard-rules.pro'
        }
    }
}
```

### 3. 构建发布版 APK

在 Android Studio 中:
1. Build → Generate Signed Bundle / APK
2. 选择 APK
3. 选择密钥库文件
4. 输入密码
5. 选择 release 构建类型
6. 点击 Finish

## 🐛 常见问题

### 问题 1: Gradle 同步失败
**解决**: 检查网络连接，配置 Gradle 镜像

### 问题 2: SDK 版本不匹配
**解决**: 在 Android Studio 中安装对应的 SDK 版本

### 问题 3: 应用闪退
**解决**: 检查 `capacitor.config.json` 中的 `webDir` 是否正确

### 问题 4: 资源文件找不到
**解决**: 确保运行了 `npm run build` 和 `npx cap sync`

## 📱 测试应用

### 在模拟器上测试
1. 在 Android Studio 中创建 AVD (Android Virtual Device)
2. 点击运行按钮

### 在真机上测试
1. 手机开启开发者模式和 USB 调试
2. 连接手机到电脑
3. 在 Android Studio 中选择设备并运行

## 🚀 发布到 Google Play

1. 注册 Google Play 开发者账号 ($25 一次性费用)
2. 创建应用
3. 上传签名的 APK 或 AAB
4. 填写应用信息和截图
5. 提交审核

## 📝 版本更新流程

1. 修改代码
2. 更新 `package.json` 中的版本号
3. 运行 `npm run build`
4. 运行 `npx cap sync android`
5. 在 Android Studio 中构建新的 APK
6. 测试并发布

---

**提示**: 首次打包可能需要较长时间下载 Gradle 和依赖，请耐心等待。