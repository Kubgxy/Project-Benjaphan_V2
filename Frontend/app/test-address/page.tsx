"use client";
import { useEffect, useState } from "react";
import "./page.css";

interface Address {
  subdistrict: string;
  district: string;
  province: string;
  zipcode: string;
}

interface District {
  DISTRICT_ID: number;
  DISTRICT_NAME: string;
  PROVINCE_ID: number;
}

interface Province {
  PROVINCE_ID: number;
  PROVINCE_NAME: string;
}

interface SubDistrict {
  SUB_DISTRICT_NAME: string;
  SUB_DISTRICT_CODE: string;
  DISTRICT_ID: number;
  PROVINCE_ID: number;
}

interface Zipcode {
  SUB_DISTRICT_CODE: string;
  ZIPCODE: string;
}

const AddressForm = () => {
  const [selectedAddress, setSelectedAddress] = useState<Address>({
    subdistrict: "",
    district: "",
    province: "",
    zipcode: "",
  });

  const [searchTerm, setSearchTerm] = useState("");
  const [suggestions, setSuggestions] = useState<Address[]>([]);
  const [allAddresses, setAllAddresses] = useState<Address[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadAddressData = async () => {
      try {
        const [districts, provinces, subDistricts, zipcodes] = await Promise.all([
          fetch("/data/districts.json").then((res) => res.json()) as Promise<District[]>,
          fetch("/data/provinces.json").then((res) => res.json()) as Promise<Province[]>,
          fetch("/data/subDistricts.json").then((res) => res.json()) as Promise<SubDistrict[]>,
          fetch("/data/zipcodes.json").then((res) => res.json()) as Promise<Zipcode[]>,
        ]);

        const merged: Address[] = subDistricts
          .map((sub) => {
            const district = districts.find((d) => d.DISTRICT_ID === sub.DISTRICT_ID);
            const province = provinces.find((p) => p.PROVINCE_ID === sub.PROVINCE_ID);
            const zip = zipcodes.find((z) => z.SUB_DISTRICT_CODE === sub.SUB_DISTRICT_CODE);

            if (district && province && zip) {
              return {
                subdistrict: sub.SUB_DISTRICT_NAME,
                district: district.DISTRICT_NAME,
                province: province.PROVINCE_NAME,
                zipcode: zip.ZIPCODE,
              };
            }
            return null;
          })
          .filter((a): a is Address => a !== null);

        setAllAddresses(merged);
      } catch (err) {
        console.error("โหลดข้อมูลไม่สำเร็จ", err);
      } finally {
        setIsLoading(false);
      }
    };

    loadAddressData();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const text = e.target.value;
    setSearchTerm(text);

    if (text.length > 1) {
      const filtered = allAddresses.filter((addr) =>
        addr.subdistrict.toLowerCase().includes(text.toLowerCase())
      );
      setSuggestions(filtered.slice(0, 10)); // แสดงสูงสุด 10 รายการ
    } else {
      setSuggestions([]);
    }
  };

  const handleSelect = (addr: Address) => {
    setSelectedAddress(addr);
    setSearchTerm(addr.subdistrict);
    setSuggestions([]); // ปิด suggestion
  };

  return (
    <div className="container">
      <div className="address-form">
        <h2>ค้นหาที่อยู่</h2>

        {isLoading ? (
          <div>กำลังโหลดข้อมูล...</div>
        ) : (
          <>
            <div className="form-group">
              <label>ตำบล</label>
              <input
                type="text"
                value={searchTerm}
                onChange={handleInputChange}
                placeholder="พิมพ์ชื่อแขวง/ตำบล"
              />
              {suggestions.length > 0 && (
                <ul className="suggestion-list">
                  {suggestions.map((addr, i) => (
                    <li
                      key={i}
                      onClick={() => handleSelect(addr)}
                      style={{ cursor: "pointer", padding: "4px 8px", borderBottom: "1px solid #ccc" }}
                    >
                      {addr.subdistrict}, {addr.district}, {addr.province}, {addr.zipcode}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {selectedAddress.subdistrict && (
              <div className="selected-address">
                <div className="form-group">
                  <label>จังหวัด:</label>
                  <input type="text" value={selectedAddress.province} readOnly />
                </div>
                <div className="form-group">
                  <label>เขต/อำเภอ:</label>
                  <input type="text" value={selectedAddress.district} readOnly />
                </div>
                <div className="form-group">
                  <label>รหัสไปรษณีย์:</label>
                  <input type="text" value={selectedAddress.zipcode} readOnly />
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default AddressForm;
