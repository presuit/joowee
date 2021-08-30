import {
  faCamera,
  faCircleNotch,
  faUserCircle,
  faVideo,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useState } from "react";
import { useEffect } from "react";
import { useParams } from "react-router-dom";
import { CampusDetailPopup } from "../components/CampusDetailPopup";
import { CampusDetailPost } from "../components/CampusDetailPost";
import { CampusHeader } from "../components/CampusHeader";
import { CampusDetailUseParamsTypes } from "../types/CampusDetail.types";
import { CampusTab } from "../types/CampusHeader.types";
import { DB_POST } from "../types/DBService.types";
import { dbService } from "../utils/firebase";
import { findGroupId } from "../utils/utils";

export const CampusDetail: React.FC = () => {
  const { campus } = useParams<CampusDetailUseParamsTypes>();
  const [groupIns, setGroupIns] = useState<any>({});
  const [loading, setLoading] = useState(false);
  const [writeMode, setWriteMode] = useState(false);
  const [posts, setPosts] = useState<DB_POST[]>([]);

  const loadGroupIns = async () => {
    const query = dbService.collection("group").where("enName", "==", campus);
    const queryResult = await query.get();

    for (const group of queryResult.docs) {
      setGroupIns(group.data());
    }
  };

  const loadPosts = async () => {
    const groupId = await findGroupId(campus);
    const query = dbService.collection("post").where("groupId", "==", groupId);
    const queryResult = await query.get();
    const arr: DB_POST[] = [];

    for (const doc of queryResult.docs) {
      const data: DB_POST = {
        body: doc.data().body,
        createdAt: doc.data().createdAt,
        creatorId: doc.data().creatorId,
        comments: doc.data().comments,
        groupId: doc.data().groupId,
      };

      arr.push(data);
    }

    setPosts(arr);
    setLoading(false);
  };

  useEffect(() => {
    setLoading(true);
    loadGroupIns();
    loadPosts();
  }, []);

  return (
    <div className="max-w-screen-lg mx-auto pb-20">
      {loading ? (
        <div className="text-center">
          <FontAwesomeIcon
            icon={faCircleNotch}
            className="text-blue-500 animate-spin text-3xl"
          />
        </div>
      ) : (
        <>
          <CampusHeader
            groupIns={groupIns}
            campus={campus}
            tab={CampusTab.detail}
          />
          <main className="w-full flex mt-5 gap-5">
            <div className="w-2/3">
              {/* writePopup */}
              <section
                className="w-full  border border-black p-5 flex items-center justify-between cursor-pointer"
                onClick={() => setWriteMode(true)}
              >
                <div className="flex items-center">
                  <FontAwesomeIcon
                    className="text-4xl mr-3 text-gray-500"
                    icon={faUserCircle}
                  />
                  <span className="text-lg">공유할 내용을 입력하세요.</span>
                </div>
                <div>
                  <FontAwesomeIcon className="mr-5 text-lg" icon={faCamera} />
                  <FontAwesomeIcon className="text-lg" icon={faVideo} />
                </div>
              </section>
              {/* posts */}
              <section className="mt-5">
                {posts.length > 0 &&
                  posts.map((elem, index) => (
                    <CampusDetailPost key={index} {...elem} />
                  ))}
              </section>
            </div>
            <div className="w-1/3">
              <section className="p-5  border border-black">
                <h2 className="mb-3 font-semibold text-lg">소개</h2>
                <h3>
                  그룹에 오신 것을 환영합니다. 다른 회원과의 교류 및 업데이트
                  수신, 동영상 공유 등의 활동을 시작하세요.
                </h3>
              </section>
              <section className="mt-5 p-5 border border-black">
                <h2 className="mb-3 font-semibold text-lg">회원 추가</h2>
              </section>
            </div>
          </main>
          {writeMode && (
            <CampusDetailPopup
              group={campus}
              mode={writeMode}
              setMode={setWriteMode}
            />
          )}
        </>
      )}
    </div>
  );
};
