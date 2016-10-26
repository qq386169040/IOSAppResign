
 IOS App Resign 
-----------------------------------  

    
### 前期准备  
    1、App文件
    2、发布证书名称
    3、MobileProvision文件
    4、BundleID
    
### 步骤  
    1、将App文件和MobileProvision文件放入source文件中
    2、在source/cerName.json中写入发布证书名称和BundleID
    3、在主目录下运行: make
    4、运行成功,会在主目录下生成target.ipa
    
### 说明
    1、发布证书名称的获取方法:
        (a)在钥匙串访问-登录中查看证书名
        (b)security find-identity -v -p codesigning
    2、MobileProvision需要与证书名称对应于同一Apple ID
    3、MobileProvision中需要添加测试时使用的设备对应的UDID
    4、本工具会自动获取MobileProvision中的BundleID,如果获取不到,才读取cerName.json中的BundleID